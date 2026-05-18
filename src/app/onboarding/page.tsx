"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Handshake, Rocket, User as UserIcon, Check, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { useAreas } from "@/lib/hooks/useAreas";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import { useAuth } from "@/lib/hooks/useAuth";
import { WorkspaceFormDialog } from "@/components/workspaces/WorkspaceFormDialog";
import { AreaSlug } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const { areas } = useAreas();
  const { workspaces, deleteWorkspace } = useWorkspaces();
  const [step, setStep] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaSlug | undefined>();

  const firstName = userData?.name ? userData.name.split(" ")[0] : "Usuario";

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleFinish = () => {
    localStorage.setItem('leso_onboarding_skipped', 'true');
    router.push("/inicio");
  };

  const openForm = (areaSlug?: AreaSlug) => {
    setSelectedArea(areaSlug);
    setFormOpen(true);
  };

  const getAreaWorkspaces = (slug: string) => workspaces.filter(w => w.areaSlug === slug);

  const step1 = (
    <div className="flex flex-col items-center text-center space-y-8 max-w-md mx-auto">
      <Logo className="scale-150 mb-4" />
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Hola, soy LESO</h1>
        <p className="text-xl text-foreground-secondary">Tu sistema operativo personal</p>
      </div>
      <div className="flex flex-col w-full gap-3 pt-8">
        <Button size="lg" onClick={nextStep}>Empezar</Button>
        <Button variant="ghost" onClick={handleFinish}>Saltar onboarding</Button>
      </div>
    </div>
  );

  const step2 = (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto w-full">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Vamos a organizar tu vida en 4 áreas</h2>
        <p className="text-foreground-secondary">LESO utiliza el método de áreas para mantener el equilibrio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {areas.map(area => {
          const Icon = area.icon === 'Briefcase' ? Briefcase : 
                       area.icon === 'Handshake' ? Handshake : 
                       area.icon === 'Rocket' ? Rocket : UserIcon;
          
          return (
            <div key={area.id} className="bg-surface border border-border rounded-card p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-foreground">{area.name}</h3>
              <p className="text-sm text-foreground-secondary">
                {area.slug === 'trabajo' ? "Tu trabajo principal y responsabilidades laborales" :
                 area.slug === 'freelance' ? "Trabajos independientes y consultorías" :
                 area.slug === 'emprendimientos' ? "Tus proyectos y negocios propios" :
                 "Todo lo que es tuyo: viajes, hobbies, vida"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="w-full pt-8 flex justify-between">
        <Button variant="ghost" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-2" /> Atrás</Button>
        <Button onClick={nextStep} className="min-w-[120px]">Continuar</Button>
      </div>
    </div>
  );

  const step3 = (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto w-full">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">¿En qué estás trabajando ahora?</h2>
        <p className="text-foreground-secondary">Creá los espacios de trabajo principales para cada área.</p>
      </div>

      <div className="w-full space-y-6">
        {areas.map(area => {
          const areaWorkspaces = getAreaWorkspaces(area.slug);
          return (
            <div key={area.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" /> {area.name}
                </h3>
                <Button variant="outline" size="sm" onClick={() => openForm(area.slug as AreaSlug)}>
                  <Plus className="w-4 h-4 mr-1" /> Agregar workspace
                </Button>
              </div>

              {areaWorkspaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {areaWorkspaces.map(w => (
                    <div key={w.id} className="flex items-center justify-between bg-surface-elevated border border-border rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: w.color }} />
                        <span className="font-medium text-sm">{w.name}</span>
                      </div>
                      <button onClick={() => deleteWorkspace(w.id)} className="text-foreground-tertiary hover:text-danger p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-foreground-secondary italic">Aún no agregaste workspaces a esta área.</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full pt-8 flex justify-between items-center">
        <Button variant="ghost" onClick={prevStep}><ArrowLeft className="w-4 h-4 mr-2" /> Atrás</Button>
        <div className="space-x-3">
          <Button variant="ghost" onClick={handleFinish}>Saltar y crear después</Button>
          <Button onClick={nextStep} disabled={workspaces.length === 0} className="min-w-[120px]">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );

  const step4 = (
    <div className="flex flex-col items-center space-y-8 max-w-xl mx-auto w-full text-center">
      <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mb-4">
        <Check className="w-8 h-8" strokeWidth={3} />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Todo listo, {firstName}</h2>
        <p className="text-foreground-secondary">Tu ecosistema personal ya está preparado.</p>
      </div>

      <div className="bg-surface border border-border rounded-card p-6 w-full text-left space-y-4">
        <h3 className="font-medium text-foreground border-b border-border pb-2">Resumen de tu entorno</h3>
        {areas.map(area => {
          const aws = getAreaWorkspaces(area.slug);
          if (aws.length === 0) return null;
          return (
            <div key={area.id} className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-foreground-tertiary uppercase">{area.name}</span>
              <div className="flex flex-wrap gap-2">
                {aws.map(w => (
                  <span key={w.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-surface-elevated rounded-md text-sm border border-border">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: w.color }} />
                    {w.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full pt-8">
        <Button size="lg" className="w-full text-lg h-14" onClick={handleFinish}>Entrar a mi Life OS</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Progress Dots */}
      <div className="fixed top-8 left-0 right-0 flex justify-center gap-3">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              i === step ? "bg-primary scale-125" : 
              i < step ? "bg-primary/50" : "bg-border"
            )} 
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {step === 1 && step1}
          {step === 2 && step2}
          {step === 3 && step3}
          {step === 4 && step4}
        </motion.div>
      </AnimatePresence>

      <WorkspaceFormDialog 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        defaultAreaSlug={selectedArea}
      />
    </div>
  );
}
