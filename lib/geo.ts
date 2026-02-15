export interface GeoInfo {
  city: string;
  country: string;
  region: string;
};

export async function getGeoInfo(ip: string): Promise<GeoInfo> {
  const fallback: GeoInfo = { city: "Unknown", country: "Unknown", region: "Unknown" };

  if (!ip || ip === "Unknown" || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.")) {
    return fallback;
  };

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,regionName`, { signal: AbortSignal.timeout(3000) });

    if(!res.ok) return fallback;

    const data = await res.json();
    if (data.status !== "success") return fallback;

    return {
      city: data.city || "Unknown",
      country: data.country || "Unknown",
      region: data.region || "Unknown",
    };
  } catch {
    return fallback;
  };
};

export function extractIp(request: Request): string {
  const headers = (request as import("next/server").NextRequest).headers;

  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "Unknown"
  );
};

export function parseBrowser(ua: string): string {
  if (!ua) return "Unknown";
  if (ua.includes("Edg/") || ua.includes("EdgA/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome/") && !ua.includes("Chromium")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("MSIE") || ua.includes("Trident/")) return "IE";
  return "Unknown";
};

export function parseOS(ua: string): string {
  if (!ua) return "Unknown";
  if (ua.includes("Windows NT 10.0")) return "Windows 10/11";
  if (ua.includes("Windows NT")) return "Windows";
  if (ua.includes("iPhone")) return "iOS (iPhone)";
  if (ua.includes("iPad")) return "iOS (iPad)";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("Mac OS X")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown";
};