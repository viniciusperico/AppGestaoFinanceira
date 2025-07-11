"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

/**
 * Interface de props para o `ResponsiveDialog`.
 */
interface ResponsiveDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

/**
 * `ResponsiveDialog` é um componente que renderiza um diálogo (`Dialog`) em telas maiores
 * e uma gaveta (`Sheet`) em telas móveis, proporcionando uma experiência de usuário otimizada.
 *
 * @param {ResponsiveDialogProps} props - As props do componente.
 * @returns {JSX.Element} O componente de diálogo responsivo.
 */
const ResponsiveDialog = ({ children, ...props }: ResponsiveDialogProps) => {
  const isMobile = useIsMobile()
  const Component = isMobile ? Sheet : Dialog
  return <Component {...props}>{children}</Component>
}

/**
 * Gatilho para o `ResponsiveDialog`. Renderiza um `SheetTrigger` ou `DialogTrigger`
 * dependendo do tamanho da tela.
 */
const ResponsiveDialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof DialogTrigger>
>((props, ref) => {
    const isMobile = useIsMobile();
    const Component = isMobile ? SheetTrigger : DialogTrigger;
    return <Component {...props} ref={ref} />;
});
ResponsiveDialogTrigger.displayName = "ResponsiveDialogTrigger";


/**
 * Conteúdo para o `ResponsiveDialog`. Renderiza um `SheetContent` ou `DialogContent`
 * dependendo do tamanho da tela.
 */
const ResponsiveDialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof DialogContent>
>(({ className, children, ...props }, ref) => {
  const isMobile = useIsMobile()

  const handleOpenAutoFocus = (event: Event) => {
    if (isMobile) {
      event.preventDefault()
    }
  }

  if (isMobile) {
    return (
      <SheetContent ref={ref} side="bottom" className={cn("max-h-[90vh] flex flex-col p-4", className)} onOpenAutoFocus={handleOpenAutoFocus} {...props}>
        {children}
      </SheetContent>
    )
  }

  return (
    <DialogContent ref={ref} className={cn("max-h-[85vh] flex flex-col", className)} {...props}>
      {children}
    </DialogContent>
  )
})
ResponsiveDialogContent.displayName = "ResponsiveDialogContent"

/**
 * Cabeçalho para o `ResponsiveDialog`.
 */
const ResponsiveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <SheetHeader className={cn("text-left p-2", className)} {...props} />
)
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader"


/**
 * Rodapé para o `ResponsiveDialog`.
 */
const ResponsiveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <SheetFooter className={cn("mt-auto bg-background p-2 pt-4", className)} {...props} />
)
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter"


/**
 * Título para o `ResponsiveDialog`.
 */
const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof SheetTitle>,
  React.ComponentPropsWithoutRef<typeof SheetTitle>
>(({ className, ...props }, ref) => (
  <SheetTitle ref={ref} className={className} {...props} />
))
ResponsiveDialogTitle.displayName = "ResponsiveDialogTitle"

/**
 * Descrição para o `ResponsiveDialog`.
 */
const ResponsiveDialogDescription = React.forwardRef<
  React.ElementRef<typeof SheetDescription>,
  React.ComponentPropsWithoutRef<typeof SheetDescription>
>(({ className, ...props }, ref) => (
  <SheetDescription ref={ref} className={className} {...props} />
))
ResponsiveDialogDescription.displayName = "ResponsiveDialogDescription"


export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogFooter,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
}
