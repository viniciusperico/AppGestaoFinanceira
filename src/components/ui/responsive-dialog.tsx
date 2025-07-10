
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

interface ResponsiveDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const ResponsiveDialog = ({ children, ...props }: ResponsiveDialogProps) => {
  const isMobile = useIsMobile()
  const Component = isMobile ? Sheet : Dialog
  return <Component {...props}>{children}</Component>
}

const ResponsiveDialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<typeof DialogTrigger>
>((props, ref) => {
    const isMobile = useIsMobile();
    const Component = isMobile ? SheetTrigger : DialogTrigger;
    return <Component {...props} ref={ref} />;
});
ResponsiveDialogTrigger.displayName = "ResponsiveDialogTrigger";


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

const ResponsiveDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <SheetHeader className={cn("text-left", className)} {...props} />
)
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader"


const ResponsiveDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <SheetFooter className={cn("mt-auto bg-background pt-4", className)} {...props} />
)
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter"


const ResponsiveDialogTitle = React.forwardRef<
  React.ElementRef<typeof SheetTitle>,
  React.ComponentPropsWithoutRef<typeof SheetTitle>
>(({ className, ...props }, ref) => (
  <SheetTitle ref={ref} className={className} {...props} />
))
ResponsiveDialogTitle.displayName = "ResponsiveDialogTitle"

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
