import * as React from "react"
import { cn } from "@/lib/utils"
import { Container, Row, Col, Section } from "./grid"
import { PageTitle, Description } from "./typography"
import { Button } from "./button"

// Interface pour l'en-tête de page
interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    className?: string
    icon?: React.ReactNode
  }
  children?: React.ReactNode
}

function PageHeader({ title, description, action, children }: PageHeaderProps) {
  return (
    <Section spacing="sm">
      <Container>
        <Row>
          <Col span={12}>
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div>
                <PageTitle>{title}</PageTitle>
                {description && (
                  <Description className="mt-1">{description}</Description>
                )}
              </div>
              {action && (
                <Button 
                  onClick={action.onClick}
                  className={action.className}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </Button>
              )}
              {children}
            </div>
          </Col>
        </Row>
      </Container>
    </Section>
  )
}

// Interface pour le contenu principal
interface PageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "none" | "sm" | "md" | "lg"
}

function PageContent({ className, spacing = "md", children, ...props }: PageContentProps) {
  return (
    <Section spacing={spacing}>
      <Container>
        <Row gutter="lg">
          <Col span={12}>
            <div className={cn("space-y-6", className)} {...props}>
              {children}
            </div>
          </Col>
        </Row>
      </Container>
    </Section>
  )
}

// Interface pour une section de contenu avec titre
interface ContentSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    className?: string
    icon?: React.ReactNode
  }
  spacing?: "none" | "sm" | "md" | "lg"
}

function ContentSection({ 
  title, 
  description, 
  action, 
  spacing = "md", 
  className, 
  children, 
  ...props 
}: ContentSectionProps) {
  return (
    <Section spacing={spacing} className={className} {...props}>
      <Container>
        {(title || description || action) && (
          <Row className="mb-6">
            <Col span={12}>
              <div className="flex items-center justify-between">
                <div>
                  {title && (
                    <PageTitle as="h2" className="text-xl mb-2">
                      {title}
                    </PageTitle>
                  )}
                  {description && (
                    <Description>{description}</Description>
                  )}
                </div>
                {action && (
                  <Button 
                    onClick={action.onClick}
                    className={action.className}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        )}
        <Row gutter="lg">
          <Col span={12}>
            {children}
          </Col>
        </Row>
      </Container>
    </Section>
  )
}

// Layout wrapper principal
interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: PageHeaderProps
}

function PageLayout({ header, children, className, ...props }: PageLayoutProps) {
  return (
    <div className={cn("min-h-screen", className)} {...props}>
      {header && <PageHeader {...header} />}
      {children}
    </div>
  )
}

export { PageLayout, PageHeader, PageContent, ContentSection } 