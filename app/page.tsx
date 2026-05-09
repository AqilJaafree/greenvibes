import Link from "next/link";
import BlurText from "./components/ui/BlurText";
import RotatingText from "./components/ui/RotatingText";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFEF0]">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20">
        <div className="border-3 border-black p-8 md:p-14 shadow-[8px_8px_0px_black] bg-[#FFFEF0]">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-4">
            Badal Haji — بدل حج
          </p>

          <h1 className="text-4xl md:text-6xl font-black leading-tight text-black mb-4">
            Can&apos;t make it to{" "}
            <span className="text-emerald-600">Makkah?</span>
            <br />
            Someone goes for you.
          </h1>

          <div className="flex items-center gap-3 text-2xl md:text-3xl font-black text-black mb-8">
            <span>Find a</span>
            <span className="border-3 border-black bg-yellow-300 px-3 py-1 shadow-[4px_4px_0px_black] inline-flex overflow-hidden">
              <RotatingText
                texts={["pilgrim", "helper", "guide", "volunteer"]}
                rotationInterval={2200}
                mainClassName="text-black"
              />
            </span>
            <span>near the Kaaba.</span>
          </div>

          <BlurText
            text="You ask. A verified pilgrim already in Makkah accepts, pays a small deposit, performs Hajj with your name in their intention, and submits GPS + voice proof — all stored permanently."
            className="text-base md:text-lg text-gray-700 max-w-2xl mb-10 leading-relaxed"
            animateBy="words"
            direction="bottom"
            delay={60}
          />

          <div className="flex flex-wrap gap-4">
            <Link
              href="/requests/new"
              className="text-base font-black border-3 border-black px-6 py-3 bg-emerald-500 hover:bg-emerald-400 shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              I need someone to perform Hajj for me
            </Link>
            <Link
              href="/requests"
              className="text-base font-black border-3 border-black px-6 py-3 bg-yellow-300 hover:bg-yellow-200 shadow-[4px_4px_0px_black] hover:shadow-[2px_2px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              I&apos;m in Makkah — I can help
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-black text-black mb-8 border-b-3 border-black pb-4">
          How it works
        </h2>

        <div className="grid md:grid-cols-3 gap-0 border-3 border-black">
          {[
            {
              step: "01",
              who: "You (the family)",
              title: "Make a request",
              body: "Fill in the name of the person you want Hajj performed for, your contact, and a small deposit. That deposit locks the request so it's real.",
              color: "bg-yellow-300",
            },
            {
              step: "02",
              who: "The pilgrim",
              title: "Accept & travel",
              body: "A person already in Makkah finds your request, pays a small deposit to commit, then performs Hajj with your loved one's name in their intention.",
              color: "bg-emerald-300",
            },
            {
              step: "03",
              who: "Proof stored forever",
              title: "GPS + voice proof",
              body: "From inside Masjid al-Haram, the pilgrim records a voice declaration and captures their GPS. Both are stored permanently — you can verify any time.",
              color: "bg-[#FFFEF0]",
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`${item.color} border-r-3 border-black last:border-r-0 p-6`}
            >
              <p className="text-5xl font-black text-black/20 mb-3">{item.step}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                {item.who}
              </p>
              <h3 className="text-xl font-black text-black mb-2">{item.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why trust it */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-3 border-black p-6 shadow-[6px_6px_0px_black] bg-white">
            <h3 className="text-xl font-black mb-3">Why should I trust this?</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-black text-emerald-600 text-lg leading-none">✓</span>
                <span>The pilgrim&apos;s GPS is captured <strong>inside Masjid al-Haram</strong> — the app verifies it automatically.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-emerald-600 text-lg leading-none">✓</span>
                <span>The voice recording is stored permanently — it cannot be deleted or changed later.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-emerald-600 text-lg leading-none">✓</span>
                <span>Both you and the pilgrim put down a small deposit — so neither side can walk away without cost.</span>
              </li>
              <li className="flex gap-3">
                <span className="font-black text-emerald-600 text-lg leading-none">✓</span>
                <span>No middleman holds the money. Transfers happen directly between wallets.</span>
              </li>
            </ul>
          </div>

          <div className="border-3 border-black p-6 shadow-[6px_6px_0px_black] bg-white">
            <h3 className="text-xl font-black mb-3">Who is this for?</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-black flex-shrink-0" />
                <span>Families whose elderly or ill relatives cannot travel to perform Hajj themselves.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-black flex-shrink-0" />
                <span>Those who want to perform Hajj on behalf of a deceased parent or relative.</span>
              </li>
              <li className="flex gap-3">
                <span className="w-2 h-2 mt-1.5 rounded-full bg-black flex-shrink-0" />
                <span>Pilgrims already in Makkah who want to help others while they are there.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t-3 border-black bg-black text-[#FFFEF0]">
        <div className="max-w-5xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-black mb-1">Ready to get started?</p>
            <p className="text-sm text-gray-400">Connect your wallet and it takes less than 2 minutes.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/requests/new"
              className="text-sm font-black border-3 border-[#FFFEF0] px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 transition-colors"
            >
              Ask for Hajj
            </Link>
            <Link
              href="/requests"
              className="text-sm font-black border-3 border-[#FFFEF0] px-5 py-2.5 hover:bg-white/10 transition-colors"
            >
              Browse open requests
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
