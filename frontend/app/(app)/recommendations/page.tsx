"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import { useRecommendations } from "@/hooks/use-recommendations";

export default function RecommendationsPage() {
  const { lastRecommendation: { data: recommendations, isLoading, refetch} } = useRecommendations()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-2">IA Concierge</h1>
        <p className="opacity-60 font-medium">Analizando tus gustos literarios...</p>
      </div>

      {!recommendations && !isLoading && (
        <div className="card bg-primary text-primary-content p-10 text-center rounded-[3rem] shadow-2xl shadow-primary/20">
          <SparklesIcon className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-4">¿Buscas tu próxima gran aventura?</h2>
          <button 
            onClick={() => refetch()}
            className="btn btn-white rounded-2xl font-black"
          >
            Generar Recomendaciones Mágicas
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center py-20">
          <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
          <p className="font-bold animate-bounce text-sm uppercase tracking-tighter">Consultando a los oráculos...</p>
        </div>
      )}

      <div className="grid gap-6">
        {recommendations?.map((rec: any, i: number) => (
          <div key={i} className="card bg-base-100 border border-base-200 shadow-sm p-6 hover:border-primary transition-colors group">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black group-hover:text-primary transition-colors">{rec.title}</h3>
                <p className="font-bold opacity-50 mb-3">{rec.author}</p>
                <div className="bg-base-200 p-4 rounded-2xl italic text-sm opacity-80">
                  "{rec.reason}"
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}