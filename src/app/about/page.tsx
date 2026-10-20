"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* HEADER */}
      <section className="pt-20 md:pt-40 pb-8 md:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-brand-accent mb-2 sm:mb-6 block">Our Story</span>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-brand-dark mb-3 sm:mb-6 tracking-tight">
            Crafting Visual <br className="hidden md:block"/> Excellence.
          </h1>
          <p className="text-xs sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            We are more than just a printing service. We are a dedicated studio committed to bringing your brand's physical presence to the highest standard.
          </p>
        </motion.div>
      </section>

      {/* STORY SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl"
          >
            <Image 
              src="https://images.unsplash.com/photo-1562664377-709f2c337eb2?q=80&w=1000&auto=format&fit=crop" 
              alt="Suasana workshop dan tim profesional Pusat Cetak Padang sedang memproduksi pesanan cetak berkualitas tinggi" 
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-brand-dark tracking-tight leading-snug">
              Elevating standards in the printing industry since 2018.
            </h2>
            <div className="space-y-6 text-gray-500 text-lg font-light leading-relaxed">
              <p>
                Founded on the belief that high-quality printing shouldn't be complicated or excessively expensive, we set out to build a streamlined experience for businesses and creatives alike.
              </p>
              <p>
                By combining state-of-the-art machinery with a team of meticulous professionals, we ensure that every banner, sticker, and signage that leaves our studio meets strict quality controls.
              </p>
              <p>
                Your brand's physical representation matters. We are here to make sure it looks absolutely flawless.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROSES KERJA */}
      <section className="py-32 bg-[#F8F9FA] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-xs font-semibold tracking-widest uppercase text-brand-accent mb-4 block">Workflow</span>
            <h2 className="font-display text-4xl md:text-5xl text-brand-dark tracking-tight">Our Process</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { num: "01", title: "Consultation", desc: "We discuss your specific needs, materials, and expectations to ensure a perfect match." },
              { num: "02", title: "Pre-press", desc: "Our team reviews and optimizes your files for flawless print reproduction." },
              { num: "03", title: "Production", desc: "Executing the print using industry-leading technology and premium substrates." },
              { num: "04", title: "Delivery", desc: "Careful packaging and swift delivery to your designated location." }
            ].map((step, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                key={idx} 
                className="flex flex-col"
              >
                <div className="text-brand-accent font-display text-4xl mb-6 opacity-80">{step.num}</div>
                <h3 className="text-xl font-semibold mb-4 text-brand-dark">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-light">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
