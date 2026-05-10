package middleware

import (
	"net/http"
	"sync"
	"time"
)

// RateLimiter — IP bazlı basit sliding-window rate limiter.
// Harici bağımlılık gerektirmez.
type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	limit    int
	window   time.Duration
}

type visitor struct {
	timestamps []time.Time
}

// NewRateLimiter — limit: pencere başına izin verilen istek sayısı, window: zaman penceresi
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*visitor),
		limit:    limit,
		window:   window,
	}

	// Eski kayıtları temizlemek için arka plan goroutine
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

	// Pencere dışı eski kayıtları temizle
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

// RateLimit — HTTP middleware. Limit aşıldığında 429 Too Many Requests döner.
func (rl *RateLimiter) RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		// Proxy arkasındaysa gerçek IP'yi al
		if forwarded := r.Header.Get("X-Real-IP"); forwarded != "" {
			ip = forwarded
		} else if forwarded := r.Header.Get("CF-Connecting-IP"); forwarded != "" {
			ip = forwarded
		}

		if !rl.isAllowed(ip) {
			http.Error(w, "Çok fazla istek gönderdiniz, lütfen bekleyin", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
