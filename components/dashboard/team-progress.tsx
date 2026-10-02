"use client";

import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Progress = {
  verifiedTotal?: number;
  pendingTotal?: number;
  departmentRows?: {
    department: string;
    verifiedCount: number;
    rank: number;
    progress: number;
  }[];
  members?: any[];
};

export function TeamProgress({ data, user }: { data: Progress, user: any }) {
  const members = data?.members || [];

  return (
    <section className="space-y-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-md">
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight flex items-center gap-space-sm">
            <span>Nexus Progress</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
          </h2>
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-high/80 border border-outline-variant/30 text-on-surface-variant font-label-caps text-label-caps">
            <span className="material-symbols-outlined text-[14px] text-primary-container">grid_view</span>
            {members.length} Active Nodes
          </div>
        </div>
        <div className="flex items-center gap-space-xs text-on-surface-variant">
          <button className="p-1.5 rounded bg-surface-container border border-white/10 hover:text-primary transition-colors" title="Matrix View">
            <span className="material-symbols-outlined text-[18px]">view_module</span>
          </button>
          <button className="p-1.5 rounded bg-surface-container-lowest border border-white/5 hover:text-primary transition-colors" title="List View">
            <span className="material-symbols-outlined text-[18px]">table_rows</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {members.map((member) => {
          let cardClass = "glass-card-interactive rounded-xl p-space-lg flex flex-col justify-between relative overflow-hidden group";
          let crownBadge = null;
          
          if (member.color === "magenta") {
            cardClass += " neon-border-magenta";
            crownBadge = (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container/15 border border-secondary-container/40 text-secondary-container font-label-caps text-[10px] tracking-wider font-semibold shadow-[0_0_10px_rgba(229,69,255,0.25)]">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>crown</span>
                CORE
              </div>
            );
          } else if (member.color === "cyan") {
            cardClass += " border-primary-container/50 shadow-[0_0_24px_rgba(0,240,255,0.15)]";
            crownBadge = (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-container/15 border border-primary-container/40 text-primary-container font-label-caps text-[10px] tracking-wider font-semibold shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                CORE
              </div>
            );
          } else {
            crownBadge = (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant font-label-caps text-[10px] tracking-wider">
                MEMBER
              </div>
            );
          }

          return (
            <Dialog key={member.id}>
              <DialogTrigger className={`${cardClass} cursor-pointer text-left focus:outline-none border-none outline-none block w-full`}>
                  {member.color === "magenta" && <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/10 rounded-bl-full pointer-events-none"></div>}
                  {member.color === "cyan" && <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/15 rounded-bl-full pointer-events-none"></div>}
                  
                  <div className="space-y-space-md relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-space-md">
                        <div className={`relative p-0.5 rounded-lg ${member.color === 'magenta' ? 'bg-gradient-to-b from-secondary-container to-secondary-container/20 shadow-[0_0_12px_rgba(229,69,255,0.4)]' : member.color === 'cyan' ? 'bg-gradient-to-b from-primary-container to-primary-container/20 shadow-[0_0_16px_rgba(0,240,255,0.5)]' : 'bg-surface-container-high border border-outline-variant/50'}`}>
                          <img className="w-12 h-12 rounded object-cover" alt={member.name} src={member.avatar} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className={`font-title-lg text-title-lg font-bold ${member.color === 'magenta' ? 'text-on-surface group-hover:text-secondary transition-colors' : member.color === 'cyan' ? 'text-primary cyan-glow-text' : 'text-on-surface group-hover:text-primary transition-colors'}`}>
                              {member.name}
                            </h3>
                            {member.isYou && <span className="px-1 py-0.2 rounded bg-primary-container/20 font-label-caps text-[9px] text-primary-container tracking-wider border border-primary-container/30">YOU</span>}
                          </div>
                          <p className="font-body-sm text-body-sm text-outline">{member.title}</p>
                        </div>
                      </div>
                      {crownBadge}
                    </div>

                    <div className="flex items-end justify-between pt-space-xs">
                      <div>
                        <div className="font-label-caps text-[10px] text-outline uppercase tracking-wider">Score Total</div>
                        <div className={`font-data-mono-lg text-[26px] font-bold ${member.color === 'magenta' ? 'text-secondary magenta-glow-text' : member.color === 'cyan' ? 'text-primary-container cyan-glow-text' : 'text-on-surface'}`}>
                          {member.totalPoints} <span className="text-body-sm text-outline font-normal">pts</span>
                        </div>
                      </div>
                      <div className="w-28 h-8">
                        <svg className={`w-full h-full fill-none overflow-visible ${member.color === 'magenta' ? 'stroke-secondary-container' : member.color === 'cyan' ? 'stroke-primary-container' : 'stroke-outline'}`} viewBox="0 0 100 30">
                          <path d={member.color === 'cyan' ? "M0,28 Q25,24 45,18 T75,10 T100,2" : member.color === 'magenta' ? "M0,24 Q20,22 35,14 T70,16 T100,4" : "M0,26 Q25,20 50,15 T80,18 T100,12"} strokeLinecap="round" strokeWidth="2.5"></path>
                          <circle className={`${member.color === 'magenta' ? 'fill-secondary-container shadow-[0_0_8px_#e545ff]' : member.color === 'cyan' ? 'fill-primary-container shadow-[0_0_8px_#00f0ff]' : 'fill-outline'}`} cx="100" cy={member.spark[member.spark.length - 1]} r="3.5"></circle>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="mt-space-md pt-space-sm border-t border-white/10 flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps relative z-10">
                    {member.color === 'cyan' ? (
                      <span className="text-primary-container flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container shadow-[0_0_6px_#00f0ff]"></span> +24 pts today
                      </span>
                    ) : member.color === 'magenta' ? (
                      <span className="text-secondary/80 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> 99.4% Uptime
                      </span>
                    ) : (
                      <span className="text-outline">97.8% Fidelity</span>
                    )}
                    <div className={`flex items-center gap-1 font-semibold ${member.color === 'magenta' ? 'hover:text-secondary' : member.color === 'cyan' ? 'text-primary-container hover:text-primary' : 'hover:text-primary'} transition-colors`}>
                      <span>Inspect Matrix</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </div>
                  </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-surface border border-outline-variant/30 rounded-2xl p-6">
                <DialogHeader>
                  <DialogTitle className="font-headline-sm text-on-surface">{member.name}'s Matrix</DialogTitle>
                  <DialogDescription className="text-on-surface-variant font-body-sm mt-1">
                    Telemetry node breakdown
                  </DialogDescription>
                </DialogHeader>
                <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={member.departments}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="points"
                        nameKey="name"
                        stroke="none"
                      >
                        {member.departments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#00f0ff', '#e545ff', '#34d399', '#fbbf24'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#181b25", borderColor: "#31353f", color: "#dfe2ef", borderRadius: "8px" }}
                        itemStyle={{ color: "#00f0ff", fontWeight: "bold" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </DialogContent>
            </Dialog>
          );
        })}
      </div>
    </section>
  );
}
