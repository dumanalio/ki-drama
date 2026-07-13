export interface VideoEmbed {
  platform: "youtube" | "vimeo";
  embedUrl: string;
}

/**
 * Erlaubt ausschließlich YouTube- und Vimeo-URLs und baut daraus selbst eine
 * privatsphärefreundliche Embed-URL -- die eingegebene URL landet nie direkt
 * im iframe-src, das schließt beliebige/böswillige URLs aus.
 */
export function parseVideoEmbed(rawUrl: string): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    if (!/^[\w-]{6,}$/.test(id)) return null;
    return { platform: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    let id: string | null = null;
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else if (url.pathname.startsWith("/embed/")) {
      id = url.pathname.split("/")[2];
    } else if (url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/")[2];
    }
    if (!id || !/^[\w-]{6,}$/.test(id)) return null;
    return { platform: "youtube", embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
  }

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (!id || !/^\d+$/.test(id)) return null;
    return { platform: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` };
  }

  if (host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();
    if (!id || !/^\d+$/.test(id)) return null;
    return { platform: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` };
  }

  return null;
}
