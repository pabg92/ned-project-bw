"use client"

import Image from "next/image"
import { typography, spacing } from "@/lib/typography"

const statistics = [
  {
    id: 1,
    iconPath: "/board-champions-assets/2000 Experts.svg",
    number: "OVER 2,000",
    text: "EXPERTS APPOINTED",
    color: "text-[#7394c7]",
  },
  {
    id: 2,
    iconPath: "/board-champions-assets/70Awards.svg",
    number: "RECEIVED OVER",
    subNumber: "70 AWARDS",
    text: "",
    color: "text-[#7394c7]",
  },
  {
    id: 3,
    iconPath: "/board-champions-assets/23Years.svg",
    number: "23 YEARS",
    text: "OF EXPERIENCE",
    color: "text-[#7394c7]",
  },
  {
    id: 4,
    iconPath: "/board-champions-assets/80Team.svg",
    number: "80+ STRONG TEAM",
    text: "OF EXPERTS",
    color: "text-[#7394c7]",
  },
]

export default function BusinessStatsSection() {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className={spacing.container}>
        <div className="bg-white rounded-2xl shadow-lg py-12 px-6">
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${spacing.grid.base} max-w-6xl mx-auto`}>
            {statistics.map((stat) => {
              return (
                <div key={stat.id} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-4">
                    <Image
                      src={stat.iconPath}
                      alt={stat.text || stat.number}
                      width={60}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <div className={`font-akrive-grotesk font-bold text-xl md:text-2xl mb-2 ${stat.color}`}>
                    {stat.number}
                    {stat.subNumber && <div className="text-lg md:text-xl mt-1">{stat.subNumber}</div>}
                  </div>
                  {stat.text && <div className="font-medium text-sm md:text-base text-gray-700">{stat.text}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}