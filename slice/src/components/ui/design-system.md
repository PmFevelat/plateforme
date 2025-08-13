# Système de Design - Grille 12 Colonnes

## Vue d'ensemble

Ce système de design unifie l'apparence et la cohérence de toutes les pages de l'application avec :

1. **Grille responsive en 12 colonnes** (inspirée de Bootstrap/Material Design)
2. **Typographie cohérente** avec hiérarchie standardisée
3. **Espacements et marges harmonisés**
4. **Composants réutilisables** pour layouts de page

## Composants Principaux

### 1. Système de Grille (`grid.tsx`)

#### Container
- **Purpose**: Conteneur principal avec largeur maximale et padding
- **Props**: `fluid` (boolean) - pour largeur 100% sans max-width

#### Row
- **Purpose**: Ligne de grille avec 12 colonnes
- **Props**: `gutter` ("none" | "sm" | "md" | "lg") - espacement entre colonnes

#### Col
- **Purpose**: Colonne responsive avec spans
- **Props**: 
  - `span` (1-12) - largeur de base
  - `xs`, `sm`, `md`, `lg`, `xl` (1-12) - largeurs responsive
  - `offset`, `xsOffset`, etc. - décalages

#### Section
- **Purpose**: Section de page avec espacements verticaux cohérents
- **Props**: `spacing` ("none" | "sm" | "md" | "lg" | "xl")

### 2. Système Typographique (`typography.tsx`)

#### PageTitle
- **Usage**: Titres principaux de page (H1)
- **Taille**: `text-2xl`
- **Props**: `variant`, `weight`, `as`

#### SectionTitle  
- **Usage**: Titres de section (H2, H3)
- **Tailles**: `sm` (text-lg), `md` (text-xl), `lg` (text-2xl)
- **Props**: `size`, `variant`, `weight`, `as`

#### CardTitleTypography
- **Usage**: Titres de cartes et composants
- **Tailles**: `sm` (text-sm), `md` (text-base)

#### Description
- **Usage**: Textes descriptifs et sous-titres
- **Tailles**: `xs`, `sm`, `md`
- **Variant par défaut**: `muted`

#### Metadata
- **Usage**: Dates, statuts, informations secondaires
- **Taille**: `text-xs`

## Breakpoints Responsive

```
xs: < 640px   (mobile)
sm: 640px     (tablet portrait)
md: 768px     (tablet landscape)
lg: 1024px    (desktop)
xl: 1280px    (large desktop)
```

## Exemples d'Usage

### Layout de page basique
```tsx
<Section spacing="sm">
  <Container>
    <Row>
      <Col span={12}>
        <PageTitle>Ma Page</PageTitle>
      </Col>
    </Row>
  </Container>
</Section>

<Section spacing="md">
  <Container>
    <Row gutter="md">
      <Col lg={8} md={12} span={12}>
        {/* Contenu principal */}
      </Col>
      <Col lg={4} md={12} span={12}>
        {/* Sidebar */}
      </Col>
    </Row>
  </Container>
</Section>
```

### Grid 3 colonnes responsive
```tsx
<Row gutter="md">
  <Col lg={4} md={6} span={12}>
    <Card>Contenu 1</Card>
  </Col>
  <Col lg={4} md={6} span={12}>
    <Card>Contenu 2</Card>
  </Col>
  <Col lg={4} md={12} span={12}>
    <Card>Contenu 3</Card>
  </Col>
</Row>
```

## Classes CSS Disponibles

Le système génère automatiquement toutes les classes nécessaires :

- `.col-span-1` à `.col-span-12`
- `.sm:col-span-1` à `.sm:col-span-12`
- `.md:col-span-1` à `.md:col-span-12`
- `.lg:col-span-1` à `.lg:col-span-12`
- `.xl:col-span-1` à `.xl:col-span-12`

## Avantages

✅ **Cohérence visuelle** sur toutes les pages  
✅ **Responsive design** automatique  
✅ **Maintenance simplifiée** avec composants réutilisables  
✅ **Développement accéléré** avec layouts prédéfinis  
✅ **Accessibilité** avec hiérarchie sémantique  

## Migration des Pages Existantes

1. Remplacer les `div` par `Container`, `Row`, `Col`
2. Utiliser les composants typographiques au lieu des balises HTML brutes
3. Appliquer les espacements avec `Section`
4. Adapter les grilles existantes au système 12 colonnes 