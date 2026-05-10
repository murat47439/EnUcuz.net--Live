package workers

import (
	"Store-Dio/config"
	"Store-Dio/repo"
	"context"
	"time"
)

type OfferWorker struct {
	OffersRepo *repo.OffersRepo
}

func NewOfferWorker(repo *repo.OffersRepo) *OfferWorker {
	return &OfferWorker{OffersRepo: repo}
}

func (ow *OfferWorker) Start(ctx context.Context) {
	ticker := time.NewTicker(2 * time.Hour)

	for {
		select {
		case <-ticker.C:
			count, err := ow.OffersRepo.ExpireOffers(ctx)
			if err != nil {
				config.Logger.Printf("OfferWorker ExpireOffers error: %v", err)
			} else if count > 0 {
				config.Logger.Printf("OfferWorker: %d teklif süresi doldu", count)
			}
		case <-ctx.Done():
			ticker.Stop()
			return
		}
	}
}
