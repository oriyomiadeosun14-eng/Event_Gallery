import { UploadForm } from "@/components/UploadForm";
import { cardClass } from "@/components/ui/card";

export const metadata = { title: "Share your photos" };

export default function UploadPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8">
      <section className={cardClass({ tone: "sky", raised: true, className: "rounded-[36px] p-8" })}>
        <p className="text-xs uppercase tracking-[0.3em] text-ink">Share the day</p>
        <h1 className="mt-4 text-4xl font-semibold text-ink sm:text-5xl">Add your favorite moment.</h1>
        <p className="mt-4 max-w-2xl text-base text-ink sm:text-lg">
          Drop in a few photos or videos and help us build a keepsake from the weekend. New uploads stay private until the couple reviews them.
        </p>
      </section>

      <UploadForm />
    </main>
  );
}
