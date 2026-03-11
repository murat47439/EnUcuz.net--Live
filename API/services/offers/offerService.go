package offers

import (
	"Store-Dio/config"
	"Store-Dio/internal/db"
	"Store-Dio/models"
	"Store-Dio/repo"
	"Store-Dio/services/chat"
	"context"
	"fmt"
)

type OffersService struct {
	OffersRepo  *repo.OffersRepo
	ChatService *chat.ChatService
	ProductRepo *repo.ProductRepo
	db          db.TxStarter
}

func NewOffersService(repo *repo.OffersRepo, prepo *repo.ProductRepo, db db.TxStarter, chatService *chat.ChatService) *OffersService {
	return &OffersService{
		OffersRepo:  repo,
		ChatService: chatService,
		ProductRepo: prepo,
		db:          db,
	}
}

const (
	OfferPending   = 0 // Beklemede (teklif verildi, cevap yok)
	OfferAccepted  = 1 // Kabul edildi (satış gerçekleşiyor)
	OfferRejected  = 2 // Reddedildi (satıcı reddetti)
	OfferCancelled = 3 // İptal edildi (teklif veren iptal etti)
	OfferExpired   = 4 // Süresi doldu (otomatik)
)
const (
	ProductStatusDraft    = 0
	ProductStatusActive   = 1
	ProductStatusInactive = 2
	ProductStatusRejected = 3
	ProductStatusSold     = 4
)

func (os *OffersService) NewOffer(ctx context.Context, data *models.NewOffer) (int, error) {
	if data.ProductID == 0 || data.Price <= 0 || data.BidderID == 0 || data.CreatedBy == 0 {
		return 0, fmt.Errorf("Invalid data")
	}
	tx, err := os.db.BeginTxx(ctx, nil)
	if err != nil {
		return 0, err
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		} else {
			if commitErr := tx.Commit(); commitErr != nil {
				err = fmt.Errorf("transaction commit error: %w", commitErr)
			}
		}
	}()
	sId, err := os.ProductRepo.GetProductSeller(ctx, data.ProductID)
	if err != nil {
		return 0, err
	}

	exists, err := os.OffersRepo.ExistsOffer(ctx, tx, data.ProductID, data.BidderID, sId)
	if err != nil {
		return 0, err
	}
	if exists {
		return 0, fmt.Errorf("ErrOfferAlreadyExists")
	}

	if sId == data.BidderID {
		return 0, fmt.Errorf("ErrSelfOfferNotAllowed")
	}

	data.SellerID = sId

	id, err := os.OffersRepo.NewOffer(ctx, tx, data)
	if err != nil {
		return 0, err
	}
	return id, nil
}
func (os *OffersService) CounterOffer(ctx context.Context, data *models.CounterOffer, id int) (int, error) {
	if data.CreatedBy == 0 || data.Price == 0 {
		return 0, fmt.Errorf("Invalid data")
	}
	tx, err := os.db.BeginTxx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		} else {
			if commitErr := tx.Commit(); commitErr != nil {
				err = fmt.Errorf("transaction commit error: %w", commitErr)
			}
		}
	}()

	parentOffer, err := os.OffersRepo.LockAndGetPendingOffer(ctx, tx, id)
	if err != nil {
		return 0, err
	}
	if parentOffer.CreatedBy == data.CreatedBy {
		return 0, fmt.Errorf("Wait for notification from the other party.")
	}
	if parentOffer.Status != OfferPending {
		return 0, fmt.Errorf("The offer is no longer valid.")
	}
	newOffer := &models.NewOffer{
		ProductID: parentOffer.ProductID,
		BidderID:  parentOffer.BidderID,
		SellerID:  parentOffer.SellerID,
		CreatedBy: data.CreatedBy,
		Price:     data.Price,
	}

	if parentOffer.ParentID != 0 {
		newOffer.ParentID = parentOffer.ParentID
	} else {
		newOffer.ParentID = parentOffer.ID
	}
	new, err := os.OffersRepo.NewOffer(ctx, tx, newOffer)
	if err != nil {
		return 0, err
	}
	err = os.OffersRepo.UpdateOffer(ctx, tx, OfferExpired, parentOffer.ID)

	if err != nil {
		return 0, err
	}
	return new, nil
}
func (os *OffersService) UpdateOffer(ctx context.Context, data models.UpdateOffer, userID int) error {
	tx, err := os.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("TX Error")
	}
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		} else {
			if commitErr := tx.Commit(); commitErr != nil {
				err = fmt.Errorf("transaction commit error: %w", commitErr)
			}
		}
	}()
	offer, err := os.OffersRepo.LockAndGetPendingOffer(ctx, tx, data.ID)
	if err != nil {
		return err
	}
	var newStatus int
	switch data.Action {
	case "accept":
		if offer.SellerID != userID {
			return fmt.Errorf("Unauthorized")
		}
		newStatus = OfferAccepted
	case "reject":
		if offer.SellerID != userID {
			return fmt.Errorf("Unauthorized")
		}
		newStatus = OfferRejected
	case "cancel":
		if offer.BidderID != userID {
			return fmt.Errorf("Unauthorized")
		}
		newStatus = OfferCancelled
	default:
		return fmt.Errorf("Invalid action")
	}
	err = os.OffersRepo.UpdateOffer(ctx, tx, newStatus, offer.ID)
	if err != nil {
		return err
	}
	if newStatus == OfferAccepted {
		err = os.OffersRepo.RejectOtherOffers(ctx, tx, offer.ID)
		if err != nil {
			return err
		}
		err = os.ProductRepo.LockProduct(ctx, tx, offer.ProductID)
		if err != nil {
			return err
		}
		err = os.ProductRepo.UpdateProductStatus(ctx, tx, offer.ProductID, ProductStatusSold)
		if err != nil {
			return err
		}
		var chat models.NewChat
		chat.Chat.Sender = offer.SellerID
		chat.Chat.ProductID = offer.ProductID
		chat.Chat.Recipient = offer.BidderID
		chat.Message = "Merhaba, teklifiniz kabul edildi!"

		result, err := os.ChatService.NewChat(ctx, &chat.Chat, chat.Message, tx)
		if err != nil {
			return err
		}
		if !result {
			return fmt.Errorf("İşlem başarısız")
		}

		config.Logger.Printf("NewChat success: Chat created for user %d", userID)

	}

	return nil
}

func (os *OffersService) GetOffersBySeller(ctx context.Context, page, seller_id int) ([]*models.OffersModel, error) {
	if page < 1 {
		page = 1
	}
	if seller_id == 0 {
		return nil, fmt.Errorf("Unauthorized")
	}
	offers, err := os.OffersRepo.GetOffersBySeller(ctx, page, seller_id)
	if err != nil {
		return nil, fmt.Errorf(err.Error())
	}
	return offers, nil
}

func (os *OffersService) GetOffersByBidder(ctx context.Context, page, bidder_id int) ([]*models.OffersModel, error) {
	if page < 1 {
		page = 1
	}
	if bidder_id == 0 {
		return nil, fmt.Errorf("Unauthorized")
	}
	offers, err := os.OffersRepo.GetOffersByBidder(ctx, page, bidder_id)
	if err != nil {
		return nil, fmt.Errorf(err.Error())
	}
	return offers, nil
}
