import React, { JSX } from "react"
import { cn } from "@/lib/utils"

// ** Typography variant types
type TypographyVariant = 
  | "T_Bold_H1"
  | "T_Bold_H2" 
  | "T_Bold_H3"
  | "T_Bold_H4"
  | "T_Bold_H5"
  | "T_Bold_H6"
  | "T_SemiBold_H1"
  | "T_SemiBold_H2"
  | "T_SemiBold_H3"
  | "T_SemiBold_H4"
  | "T_SemiBold_H5"
  | "T_SemiBold_H6"
  | "T_Medium_H1"
  | "T_Medium_H2"
  | "T_Medium_H3"
  | "T_Medium_H4"
  | "T_Medium_H5"
  | "T_Medium_H6"
  | "T_Regular_H1"
  | "T_Regular_H2"
  | "T_Regular_H3"
  | "T_Regular_H4"
  | "T_Regular_H5"
  | "T_Regular_H6"
  | "T_Light_H1"
  | "T_Light_H2"
  | "T_Light_H3"
  | "T_Light_H4"
  | "T_Light_H5"
  | "T_Light_H6"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant: TypographyVariant
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

/**
 * Typography component for consistent text styling across the application.
 * 
 * @param {TypographyVariant} variant - The typography variant to apply
 * @param {React.ReactNode} children - The content to display
 * @param {string} className - Additional CSS classes
 * @param {keyof JSX.IntrinsicElements} as - The HTML element to render as
 * @returns {JSX.Element} The rendered typography component
 */
const Typography: React.FC<TypographyProps> = ({ 
  variant, 
  children, 
  className,
  as,
  ...props 
}) => {
  // Typography variant styles mapping
  const variantStyles: Record<TypographyVariant, string> = {
    // Bold variants
    T_Bold_H1: "text-4xl font-bold",
    T_Bold_H2: "text-3xl font-bold", 
    T_Bold_H3: "text-2xl font-bold",
    T_Bold_H4: "text-xl font-bold",
    T_Bold_H5: "text-lg font-bold",
    T_Bold_H6: "text-base font-bold",
    
    // SemiBold variants
    T_SemiBold_H1: "text-4xl font-semibold",
    T_SemiBold_H2: "text-3xl font-semibold",
    T_SemiBold_H3: "text-2xl font-semibold", 
    T_SemiBold_H4: "text-xl font-semibold",
    T_SemiBold_H5: "text-lg font-semibold",
    T_SemiBold_H6: "text-base font-semibold",
    
    // Medium variants
    T_Medium_H1: "text-4xl font-medium",
    T_Medium_H2: "text-3xl font-medium",
    T_Medium_H3: "text-2xl font-medium",
    T_Medium_H4: "text-xl font-medium", 
    T_Medium_H5: "text-lg font-medium",
    T_Medium_H6: "text-base font-medium",
    
    // Regular variants
    T_Regular_H1: "text-4xl font-normal",
    T_Regular_H2: "text-3xl font-normal",
    T_Regular_H3: "text-2xl font-normal",
    T_Regular_H4: "text-xl font-normal",
    T_Regular_H5: "text-lg font-normal", 
    T_Regular_H6: "text-base font-normal",
    
    // Light variants
    T_Light_H1: "text-4xl font-light",
    T_Light_H2: "text-3xl font-light",
    T_Light_H3: "text-2xl font-light",
    T_Light_H4: "text-xl font-light",
    T_Light_H5: "text-lg font-light",
    T_Light_H6: "text-base font-light",
  }

  // Default HTML element mapping
  const defaultElements: Record<string, keyof JSX.IntrinsicElements> = {
    H1: "h1",
    H2: "h2", 
    H3: "h3",
    H4: "h4",
    H5: "h5",
    H6: "h6",
  }

  // Extract heading level from variant
  const headingLevel = variant.split('_').pop() as string
  const Component = as || defaultElements[headingLevel] || "span"

  return React.createElement(
    Component,
    {
      className: cn(variantStyles[variant], className),
      ...props
    },
    children
  )
}

export default Typography 