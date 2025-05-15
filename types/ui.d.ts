import { ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes } from "react"

declare module "@/components/ui/button" {
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
  }
  
  export const Button: React.FC<ButtonProps>
}

declare module "@/components/ui/input" {
  interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}
  export const Input: React.FC<InputProps>
}

declare module "@/components/ui/card" {
  interface CardProps extends HTMLAttributes<HTMLDivElement> {}
  interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
  interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
  interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
  interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
  
  export const Card: React.FC<CardProps>
  export const CardHeader: React.FC<CardHeaderProps>
  export const CardTitle: React.FC<CardTitleProps>
  export const CardDescription: React.FC<CardDescriptionProps>
  export const CardContent: React.FC<CardContentProps>
}

declare module "@/components/ui/use-toast" {
  interface ToastProps {
    title?: string
    description?: string
    variant?: "default" | "destructive"
  }
  
  interface Toast {
    (props: ToastProps): void
  }
  
  export function useToast(): {
    toast: Toast
  }
} 