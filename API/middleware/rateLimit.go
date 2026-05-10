package middleware

import (
	"Store-Dio/utils"
	"net/http"
	"sync"
	"time"
)

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

type visitor struct {
	timestamps []time.Time
}

func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}

	go rl.cleanupVisitors()

	return rl
}

func (rl *RateLimiter) cleanupVisitors() {
	for {
		time.Sleep(rl.window * 2)
		rl.mu.Lock()
		for ip, v := range rl.visitors {
			now := time.Now()
			active := v.timestamps[:0]
			for _, t := range v.timestamps {
				if now.Sub(t) <= rl.window {
					active = append(active, t)
				}
			}
			if len(active) == 0 {
				delete(rl.visitors, ip)
			} else {
				v.timestamps = active
			}
		}
		rl.mu.Unlock()
	}
}

func (rl *RateLimiter) isAllowed(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()

	v, exists := rl.visitors[ip]
	if !exists {
		rl.visitors[ip] = &visitor{
			timestamps: []time.Time{now},
		}
		return true
	}

	active := v.timestamps[:0]
	for _, t := range v.timestamps {
		if now.Sub(t) <= rl.window {
			active = append(active, t)
		}
	}
	v.timestamps = active

	if len(v.timestamps) >= rl.limit {
		return false
	}

	v.timestamps = append(v.timestamps, now)
	return true
}

func (rl *RateLimiter) RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := utils.GetClientIP(r)

		if !rl.isAllowed(ip) {
			http.Error(w, "Çok fazla istek gönderdiniz, lütfen bekleyin", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
