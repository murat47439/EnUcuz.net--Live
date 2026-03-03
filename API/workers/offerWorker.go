package workers

import (
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
	ticker := time.NewTicker(120 * time.Minute)

	for {
		select {
		case <-ticker.C:
			ow.OffersRepo.ExpireOffers(ctx)
		case <-ctx.Done():
			ticker.Stop()
			return
		}
	}
}
