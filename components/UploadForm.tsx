"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CldUploadWidget, type CloudinaryUploadWidgetInfo } from "next-cloudinary";
import { Camera, CheckCircle2, Loader2 } from "lucide-react";

import { Button, buttonClass } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { inputClass } from "@/components/ui/input";
import { galleryMoments, type MomentSlug } from "@/lib/media";
import { themeColor } from "@/lib/theme";

type Details = { uploaderName: string; moment: MomentSlug; caption: string };

async function saveUpload(info: CloudinaryUploadWidgetInfo, details: Details) {
  const body = JSON.stringify({
    url: info.secure_url,
    publicId: info.public_id,
    resourceType: info.resource_type,
    width: info.width,
    height: info.height,
    ...details,
  });

  // One retry: venue connections drop out a lot.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("/api/media", { method: "POST", headers: { "Content-Type": "application/json" }, body });
      if (res.ok) return true;
      if (res.status < 500) return false;
    } catch {
      // network error: fall through to retry
    }
  }
  return false;
}

export function UploadForm() {
  const [uploaderName, setUploaderName] = useState("");
  const [moment, setMoment] = useState<MomentSlug>(galleryMoments[0].slug);
  const [caption, setCaption] = useState("");
  const [saved, setSaved] = useState(0);
  const [failed, setFailed] = useState(0);
  const [pending, setPending] = useState(0);
  const [finished, setFinished] = useState(false);

  // The widget keeps its callbacks between renders, so read the latest values from a ref.
  const details = useRef<Details>({ uploaderName, moment, caption });
  useEffect(() => {
    details.current = { uploaderName: uploaderName.trim(), moment, caption: caption.trim() };
  }, [uploaderName, moment, caption]);

  const reset = () => {
    setSaved(0);
    setFailed(0);
    setFinished(false);
    setCaption("");
  };

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return (
      <div className="rounded-4xl border border-sky bg-sky/30 p-6 text-sm text-ink">
        Uploads aren&apos;t configured yet. Set <code>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and{" "}
        <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> in <code>.env</code>, then restart the dev server.
      </div>
    );
  }

  if (finished && pending === 0 && saved > 0) {
    return (
      <div className={cardClass({ raised: true, className: "animate-fade-in rounded-4xl p-8 text-center" })}>
        <CheckCircle2 className="mx-auto h-12 w-12 text-ink" />
        <h2 className="mt-4 text-4xl text-ink">Thank you{uploaderName ? `, ${uploaderName.split(" ")[0]}` : ""}!</h2>
        <p className="mx-auto mt-3 max-w-md text-ink">
          {saved === 1 ? "Your memory is" : `All ${saved} of your memories are`} safely with us. They&apos;ll appear in the
          gallery once the couple has had a look.
        </p>
        {failed > 0 ? (
          <p className="mx-auto mt-3 max-w-md text-sm text-red-700">
            {failed} file{failed === 1 ? "" : "s"} couldn&apos;t be saved. Please try sharing {failed === 1 ? "it" : "them"} again.
          </p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="accent" onClick={reset}>
            Share more
          </Button>
          <Link href="/gallery" className={buttonClass({ variant: "outline" })}>
            See the gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass({ raised: true, className: "space-y-6 rounded-4xl p-6" })}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm text-ink">
          <span>Your name</span>
          <input
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            maxLength={80}
            autoComplete="name"
            placeholder="So the couple knows who to thank"
            className={inputClass()}
          />
        </label>

        <label className="space-y-2 text-sm text-ink">
          <span>Moment</span>
          <select
            value={moment}
            onChange={(e) => setMoment(e.target.value as MomentSlug)}
            className={inputClass()}
          >
            {galleryMoments.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-2 text-sm text-ink">
        <span>
          Caption <span className="text-ink-muted">(optional)</span>
        </span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Tell us what this moment meant to you..."
          className={inputClass()}
        />
      </label>

      <CldUploadWidget
        uploadPreset={uploadPreset}
        options={{
          multiple: true,
          maxFiles: 50,
          sources: ["local", "camera"],
          resourceType: "auto",
          clientAllowedFormats: ["image", "video"],
          maxVideoFileSize: 100_000_000,
          showPoweredBy: false,
          singleUploadAutoClose: false,
          styles: {
            palette: {
              // The widget can't use CSS classes, so read the same tokens from globals.css.
              window: themeColor("surface"),
              windowBorder: themeColor("border"),
              tabIcon: themeColor("ink"),
              menuIcons: themeColor("ink"),
              textDark: themeColor("ink"),
              textLight: themeColor("bg"),
              link: themeColor("ink"),
              action: themeColor("primary"),
              inactiveTabIcon: themeColor("ink-muted"),
              error: "#B91C1C", // not a palette colour: functional "something went wrong" red
              inProgress: themeColor("sage"),
              complete: themeColor("sage"),
              sourceBg: themeColor("bg"),
            },
          },
        }}
        onQueuesStart={() => setFinished(false)}
        onSuccess={async (result) => {
          if (typeof result.info !== "object" || !result.info) return;
          const info = result.info;
          setPending((n) => n + 1);
          const ok = await saveUpload(info, details.current);
          setPending((n) => n - 1);
          if (ok) setSaved((n) => n + 1);
          else setFailed((n) => n + 1);
        }}
        onQueuesEnd={() => setFinished(true)}
      >
        {({ open, isLoading }) => (
          <Button
            variant="accent"
            size="xl"
            onClick={() => open()}
            disabled={isLoading}
            className="w-full shadow-lg shadow-ink/10 active:scale-[0.99] disabled:cursor-wait"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
            Choose photos &amp; videos
          </Button>
        )}
      </CldUploadWidget>

      {pending > 0 || saved > 0 || failed > 0 ? (
        <p className="text-center text-sm text-ink-muted" aria-live="polite">
          {pending > 0 ? `Saving ${pending}…  ` : ""}
          {saved > 0 ? `${saved} shared` : ""}
          {failed > 0 ? ` · ${failed} failed` : ""}
        </p>
      ) : (
        <p className="text-center text-sm text-ink-muted">
          Big videos can take a minute. Keep this page open until they finish. Poor signal? You can upload later too.
        </p>
      )}
    </div>
  );
}
