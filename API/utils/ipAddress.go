package utils

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

var (
	cloudflareNets []*net.IPNet
	cfMu           sync.RWMutex
	ipFilePath     = "config/cloudflare_ips.txt"
)

func init() {
	loadFromFile()

	go updateCloudflareIPs()

	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			updateCloudflareIPs()
		}
	}()
}

func GetClientIP(r *http.Request) string {

	remoteIP := extractIPFromAddr(r.RemoteAddr)
	if remoteIP == "" {
		return ""
	}

	if !isCloudflareIP(remoteIP) {
		return remoteIP
	}

	if cfIP := sanitizeIP(r.Header.Get("CF-Connecting-IP")); cfIP != "" {
		return cfIP
	}

	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		if ip := extractFirstForwardedIP(xff); ip != "" {
			return ip
		}
	}

	if realIP := sanitizeIP(r.Header.Get("X-Real-IP")); realIP != "" {
		return realIP
	}

	return remoteIP
}

func extractIPFromAddr(remoteAddr string) string {
	if remoteAddr == "" {
		return ""
	}

	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		// Port yoksa (nadir durum) direkt parse et
		if ip := net.ParseIP(remoteAddr); ip != nil {
			return remoteAddr
		}
		return ""
	}
	return host
}

func sanitizeIP(raw string) string {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return ""
	}
	if ip := net.ParseIP(raw); ip != nil {
		return raw
	}
	return ""
}

func extractFirstForwardedIP(xff string) string {
	for _, segment := range strings.Split(xff, ",") {
		if ip := sanitizeIP(segment); ip != "" {
			return ip
		}
	}
	return ""
}

func isCloudflareIP(ipStr string) bool {
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return false
	}

	cfMu.RLock()
	defer cfMu.RUnlock()

	for _, cidr := range cloudflareNets {
		if cidr.Contains(ip) {
			return true
		}
	}
	return false
}

func updateCloudflareIPs() {
	urls := []string{
		"https://www.cloudflare.com/ips-v4",
		"https://www.cloudflare.com/ips-v6",
	}

	client := &http.Client{Timeout: 10 * time.Second}

	var newNets []*net.IPNet
	var allLines []string

	for _, url := range urls {
		resp, err := client.Get(url)
		if err != nil {
			log.Printf("[ipAddress] Cloudflare IP listesi alınamadı (%s): %v", url, err)
			continue
		}

		scanner := bufio.NewScanner(resp.Body)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" {
				continue
			}
			_, cidr, err := net.ParseCIDR(line)
			if err != nil {
				log.Printf("[ipAddress] Geçersiz CIDR atlandı: %q", line)
				continue
			}
			newNets = append(newNets, cidr)
			allLines = append(allLines, line)
		}

		if err := scanner.Err(); err != nil {
			log.Printf("[ipAddress] Scanner hatası (%s): %v", url, err)
		}

		resp.Body.Close()
	}

	if len(newNets) == 0 {
		log.Println("[ipAddress] Cloudflare'den hiç IP aralığı alınamadı, mevcut liste korunuyor.")
		return
	}

	cfMu.Lock()
	cloudflareNets = newNets
	cfMu.Unlock()

	saveToFile(allLines)
	log.Printf("[ipAddress] Cloudflare IP listesi güncellendi: %d aralık", len(newNets))
}

func loadFromFile() {
	file, err := os.Open(ipFilePath)
	if err != nil {
		return
	}
	defer file.Close()

	var loaded []*net.IPNet
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		_, cidr, err := net.ParseCIDR(line)
		if err == nil {
			loaded = append(loaded, cidr)
		}
	}

	if len(loaded) > 0 {
		cfMu.Lock()
		cloudflareNets = loaded
		cfMu.Unlock()
		log.Printf("[ipAddress] Diskten %d Cloudflare IP aralığı yüklendi", len(loaded))
	}
}

func saveToFile(lines []string) {
	dir := "config"
	if err := os.MkdirAll(dir, 0o755); err != nil {
		log.Printf("[ipAddress] config dizini oluşturulamadı: %v", err)
		return
	}

	tmpPath := ipFilePath + ".tmp"
	file, err := os.Create(tmpPath)
	if err != nil {
		log.Printf("[ipAddress] Geçici dosya oluşturulamadı: %v", err)
		return
	}

	writer := bufio.NewWriter(file)
	for _, line := range lines {
		fmt.Fprintln(writer, line)
	}

	if err := writer.Flush(); err != nil {
		file.Close()
		os.Remove(tmpPath)
		log.Printf("[ipAddress] Dosyaya yazma hatası: %v", err)
		return
	}
	file.Close()

	if err := os.Rename(tmpPath, ipFilePath); err != nil {
		os.Remove(tmpPath)
		log.Printf("[ipAddress] Dosya rename hatası: %v", err)
		return
	}
}
