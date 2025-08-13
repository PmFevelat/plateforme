import * as React from "react"
import { cn } from "@/lib/utils"

// Interface de base pour tous les composants typographiques
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "muted" | "accent"
  weight?: "normal" | "medium" | "semibold" | "bold"
}

// Titre principal (H1)
interface PageTitleProps extends TypographyProps {
  as?: "h1" | "h2"
}

function PageTitle({ 
  className, 
  variant = "default", 
  weight = "bold",
  as: Component = "h1",
  ...props 
}: PageTitleProps) {
  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    accent: "text-primary"
  }

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium", 
    semibold: "font-semibold",
    bold: "font-bold"
  }

  return (
    <Component
      className={cn(
        "text-2xl tracking-tight leading-tight",
        variantClasses[variant],
        weightClasses[weight],
        className
      )}
      {...props}
    />
  )
}

// Sous-titre (H2, H3)
interface SectionTitleProps extends TypographyProps {
  as?: "h2" | "h3" | "h4"
  size?: "sm" | "md" | "lg"
}

function SectionTitle({ 
  className, 
  variant = "default", 
  weight = "semibold",
  size = "md",
  as: Component = "h2",
  ...props 
}: SectionTitleProps) {
  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground", 
    accent: "text-primary"
  }

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold", 
    bold: "font-bold"
  }

  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <Component
      className={cn(
        "leading-tight tracking-tight",
        sizeClasses[size],
        variantClasses[variant],
        weightClasses[weight],
        className
      )}
      {...props}
    />
  )
}

// Titre de carte/composant
interface CardTitleTypographyProps extends TypographyProps {
  as?: "h3" | "h4" | "h5" | "div"
  size?: "sm" | "md"
}

function CardTitleTypography({ 
  className, 
  variant = "default", 
  weight = "semibold",
  size = "md",
  as: Component = "h3",
  ...props 
}: CardTitleTypographyProps) {
  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    accent: "text-primary"
  }

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold"
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base"
  }

  return (
    <Component
      className={cn(
        "leading-tight",
        sizeClasses[size],
        variantClasses[variant],
        weightClasses[weight],
        className
      )}
      {...props}
    />
  )
}

// Texte de description/sous-titre
interface DescriptionProps extends TypographyProps {
  as?: "p" | "div" | "span"
  size?: "xs" | "sm" | "md"
}

function Description({ 
  className, 
  variant = "muted", 
  weight = "normal",
  size = "sm",
  as: Component = "p",
  ...props 
}: DescriptionProps) {
  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    accent: "text-primary"
  }

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold"
  }

  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm", 
    md: "text-base"
  }

  return (
    <Component
      className={cn(
        "leading-normal",
        sizeClasses[size],
        variantClasses[variant],
        weightClasses[weight],
        className
      )}
      {...props}
    />
  )
}

// Texte métadata (dates, statuts, etc.)
interface MetadataProps extends TypographyProps {
  as?: "span" | "div" | "time"
}

function Metadata({ 
  className, 
  variant = "muted", 
  weight = "normal",
  as: Component = "span",
  ...props 
}: MetadataProps) {
  const variantClasses = {
    default: "text-foreground",
    muted: "text-muted-foreground",
    accent: "text-primary"
  }

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold"
  }

  return (
    <Component
      className={cn(
        "text-xs leading-tight",
        variantClasses[variant],
        weightClasses[weight],
        className
      )}
      {...props}
    />
  )
}

export { 
  PageTitle, 
  SectionTitle, 
  CardTitleTypography, 
  Description, 
  Metadata 
} 