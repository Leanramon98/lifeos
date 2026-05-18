"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-danger" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Algo salió mal</h1>
            <p className="text-sm text-foreground-secondary mb-8">
              Ha ocurrido un error inesperado. Nuestro equipo ya fue notificado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <Button 
                variant="outline" 
                onClick={() => this.setState({ hasError: false })}
                className="w-full sm:w-auto"
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Intentar de nuevo
              </Button>
              <Link href="/inicio" className="w-full sm:w-auto">
                <Button className="w-full">
                  <Home className="w-4 h-4 mr-2" /> Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
