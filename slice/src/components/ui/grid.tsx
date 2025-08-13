import * as React from "react"
import { cn } from "@/lib/utils"

// Container principal avec gestion responsive
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  fluid?: boolean
}

function Container({ className, fluid = false, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full px-4 mx-auto",
        !fluid && "max-w-screen-2xl",
        className
      )}
      {...props}
    />
  )
}

// Row pour contenir les colonnes
interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  gutter?: "none" | "sm" | "md" | "lg"
}

function Row({ className, gutter = "md", ...props }: RowProps) {
  const gutterClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6"
  }

  return (
    <div
      className={cn(
        "grid grid-cols-12",
        gutterClasses[gutter],
        className
      )}
      {...props}
    />
  )
}

// Colonne avec spans responsive
interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  offset?: number
  xsOffset?: number
  smOffset?: number
  mdOffset?: number
  lgOffset?: number
  xlOffset?: number
}

function Col({ 
  className, 
  span = 12, 
  xs, 
  sm, 
  md, 
  lg, 
  xl,
  offset,
  xsOffset,
  smOffset,
  mdOffset,
  lgOffset,
  xlOffset,
  ...props 
}: ColProps) {
  const colClasses = []

  // Classes de base
  colClasses.push(`col-span-${span}`)
  
  // Classes responsive
  if (xs) colClasses.push(`xs:col-span-${xs}`)
  if (sm) colClasses.push(`sm:col-span-${sm}`)
  if (md) colClasses.push(`md:col-span-${md}`)
  if (lg) colClasses.push(`lg:col-span-${lg}`)
  if (xl) colClasses.push(`xl:col-span-${xl}`)

  // Offsets
  if (offset) colClasses.push(`col-start-${offset + 1}`)
  if (xsOffset) colClasses.push(`xs:col-start-${xsOffset + 1}`)
  if (smOffset) colClasses.push(`sm:col-start-${smOffset + 1}`)
  if (mdOffset) colClasses.push(`md:col-start-${mdOffset + 1}`)
  if (lgOffset) colClasses.push(`lg:col-start-${lgOffset + 1}`)
  if (xlOffset) colClasses.push(`xl:col-start-${xlOffset + 1}`)

  return (
    <div
      className={cn(colClasses.join(' '), className)}
      {...props}
    />
  )
}

// Section pour organiser le contenu
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
}

function Section({ className, spacing = "lg", ...props }: SectionProps) {
  const spacingClasses = {
    none: "",
    sm: "py-4",
    md: "py-6",
    lg: "py-8",
    xl: "py-12"
  }

  return (
    <section
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  )
}

export { Container, Row, Col, Section } 