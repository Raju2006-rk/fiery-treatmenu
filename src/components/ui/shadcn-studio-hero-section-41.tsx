"use client"

import {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react"
import type {
  ComponentProps,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import useEmblaCarousel from "embla-carousel-react"
import type { UseEmblaCarouselType } from "embla-carousel-react"
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleSmallIcon,
  Flame,
  MenuIcon,
  UtensilsCrossed,
} from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type NavigationItem = {
  title: string
  href: string
}

export type NavigationSection = {
  title: string
  icon?: ReactNode
} & (
  | {
      items: NavigationItem[]
      href?: never
    }
  | {
      items?: never
      href: string
    }
)

export type MenuData = {
  id: number | string
  itemId?: string
  img: string
  imgAlt: string
  dishTitle: string
  dishPrice: string
  categoryLabel?: string
  userAvatar?: string
  userComment?: string
}

export type HeroSection41Props = {
  /** Links rendered in the header navigation (and mobile menu). */
  navigationData?: NavigationSection[]
  /** Dishes shown in the main showcase and side-scroll strip. */
  menudata?: MenuData[]
  brandName?: string
  /** Label of the header call-to-action button. */
  headerCtaLabel?: string
  /** Optional eyebrow label displayed above the main heading. */
  eyebrow?: string
  heading?: string
  description?: string
  primaryCtaLabel?: string
  secondaryCtaLabel?: string
  primaryCtaHref?: string
  secondaryCtaHref?: string
  onPrimaryCtaClick?: () => void
  onSecondaryCtaClick?: () => void
  /** Called when the user clicks a dish in either the featured slide or side-scroll strip. */
  onDishClick?: (dish: MenuData) => void
  /** Set to false when embedded under an existing app-level navigation bar. */
  showHeader?: boolean
  /** Delay between automatic slides in milliseconds. */
  autoplayDelay?: number
  className?: string
}

const FALLBACK_DISH_IMG =
  "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80"

/* -------------------------------------------------------------------------- */
/*                         UI primitives (self-contained)                     */
/* -------------------------------------------------------------------------- */

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
      },
      size: {
        default: "h-8 gap-1.5 px-2.5",
        lg: "h-11 gap-2 px-5",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

const Button = ({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const Separator = ({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) => {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselProps = {
  opts?: UseCarouselParameters[0]
  plugins?: UseCarouselParameters[1]
  setApi?: (api: CarouselApi) => void
}

const CarouselContext = createContext<{
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
} | null>(null)

const useCarousel = () => {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const Carousel = ({
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: ComponentProps<"div"> & CarouselProps) => {
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: "x" }, plugins)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        api?.scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        api?.scrollNext()
      }
    },
    [api]
  )

  useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  return (
    <CarouselContext.Provider value={{ carouselRef }}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

const CarouselContent = ({ className, ...props }: ComponentProps<"div">) => {
  const { carouselRef } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div className={cn("-ml-4 flex", className)} {...props} />
    </div>
  )
}

const CarouselItem = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full pl-4", className)}
      {...props}
    />
  )
}

const DropdownMenuContent = ({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) => {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

const DropdownMenuItem = ({
  className,
  ...props
}: MenuPrimitive.Item.Props) => {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted"
)

const NavigationMenu = ({
  align = "start",
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align">) => {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      <NavigationMenuPrimitive.Portal>
        <NavigationMenuPrimitive.Positioner
          side="bottom"
          sideOffset={8}
          align={align}
          alignOffset={0}
          className="isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-instant:transition-none"
        >
          <NavigationMenuPrimitive.Popup className="xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) rounded-lg bg-popover text-popover-foreground shadow ring-1 ring-foreground/10 transition-[opacity,transform,width,height,scale,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:duration-150 data-starting-style:scale-90 data-starting-style:opacity-0">
            <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
          </NavigationMenuPrimitive.Popup>
        </NavigationMenuPrimitive.Positioner>
      </NavigationMenuPrimitive.Portal>
    </NavigationMenuPrimitive.Root>
  )
}

const NavigationMenuList = ({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.List>) => {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        className
      )}
      {...props}
    />
  )
}

const NavigationMenuItem = ({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Item>) => {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const NavigationMenuTrigger = ({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) => {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-px ml-1 size-3 transition duration-300 group-data-popup-open/navigation-menu-trigger:rotate-180 group-data-open/navigation-menu-trigger:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

const NavigationMenuContent = ({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) => {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "h-full w-auto p-1 transition-[opacity,transform,translate] duration-[0.35s] ease-[cubic-bezier(0.22,1,0.36,1)] data-ending-style:opacity-0 data-starting-style:opacity-0 data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out",
        className
      )}
      {...props}
    />
  )
}

const NavigationMenuLink = ({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) => {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex items-center gap-2 rounded-lg p-2 text-sm transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 data-active:bg-muted/50 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Logo                                    */
/* -------------------------------------------------------------------------- */

const BistroLogo = ({ className }: { className?: string }) => {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm",
        className
      )}
      aria-hidden="true"
    >
      <UtensilsCrossed className="size-4" />
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Header navigation                             */
/* -------------------------------------------------------------------------- */

const MenuNavigation = ({
  navigationData,
  className,
  align = "start",
}: {
  navigationData: NavigationSection[]
  className?: string
  align?: "start" | "center" | "end"
}) => {
  return (
    <NavigationMenu className={className} align={align}>
      <NavigationMenuList className="flex-wrap justify-start gap-1.5">
        {navigationData.map((navItem) => {
          if (navItem.href) {
            return (
              <NavigationMenuItem key={navItem.title}>
                <NavigationMenuLink
                  href={navItem.href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent! px-3 py-1.5 text-base! text-muted-foreground hover:text-primary focus:text-primary dark:hover:bg-accent/50"
                  )}
                >
                  {navItem.title}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          }

          return (
            <NavigationMenuItem key={navItem.title}>
              <NavigationMenuTrigger className="bg-transparent px-3 py-1.5 text-base text-muted-foreground hover:text-primary focus:text-primary dark:hover:bg-accent/50 dark:data-open:hover:bg-accent/50 [&>svg]:size-4">
                {navItem.title}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-auto data-[motion=from-end]:slide-in-from-right-30! data-[motion=from-start]:slide-in-from-left-30! data-[motion=to-end]:slide-out-to-right-30! data-[motion=to-start]:slide-out-to-left-30!">
                <ul className="grid w-38 gap-4">
                  <li>
                    {navItem.items?.map((item) => (
                      <NavigationMenuLink key={item.title} href={item.href}>
                        {item.title}
                      </NavigationMenuLink>
                    ))}
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const MenuDropdown = ({
  trigger,
  navigationData,
  align = "start",
}: {
  trigger: ReactElement
  navigationData: NavigationSection[]
  align?: "center" | "end" | "start"
}) => {
  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger render={trigger} />
      <DropdownMenuContent className="w-56" align={align}>
        {navigationData.map((navItem) => {
          if (navItem.href) {
            return (
              <DropdownMenuItem
                key={navItem.title}
                render={<a href={navItem.href} />}
              >
                {navItem.icon}
                {navItem.title}
              </DropdownMenuItem>
            )
          }

          return (
            <CollapsiblePrimitive.Root
              key={navItem.title}
              render={<MenuPrimitive.Group />}
            >
              <CollapsiblePrimitive.Trigger
                nativeButton={false}
                render={
                  <DropdownMenuItem
                    closeOnClick={false}
                    className="group justify-between"
                  />
                }
              >
                {navItem.icon}
                <span className="flex-1">{navItem.title}</span>
                <ChevronRightIcon className="shrink-0 transition-transform group-data-panel-open:rotate-90" />
              </CollapsiblePrimitive.Trigger>
              <CollapsiblePrimitive.Panel className="pl-2">
                {navItem.items?.map((item) => (
                  <DropdownMenuItem
                    key={item.title}
                    render={<a href={item.href} />}
                  >
                    <CircleSmallIcon />
                    <span>{item.title}</span>
                  </DropdownMenuItem>
                ))}
              </CollapsiblePrimitive.Panel>
            </CollapsiblePrimitive.Root>
          )
        })}
      </DropdownMenuContent>
    </MenuPrimitive.Root>
  )
}

const Header = ({
  navigationData,
  brandName,
  ctaLabel,
  ctaHref,
}: {
  navigationData: NavigationSection[]
  brandName: string
  ctaLabel: string
  ctaHref: string
}) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 z-50 h-17.5 w-full border-b border-border/60 transition-all duration-300",
        {
          "bg-background/95 backdrop-blur-md shadow-md": isScrolled,
        }
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <a
          href="#"
          className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <BistroLogo />
          <span className="text-[20px] font-semibold text-primary">
            {brandName}
          </span>
        </a>

        <MenuNavigation
          navigationData={navigationData}
          className="max-lg:hidden [&_[data-slot=navigation-menu-list]]:gap-1"
        />

        <div className="flex gap-3">
          <Button
            size="lg"
            className="rounded-full"
            render={<a href={ctaHref} />}
            nativeButton={false}
          >
            {ctaLabel}
          </Button>

          <MenuDropdown
            align="end"
            navigationData={navigationData}
            trigger={
              <Button
                variant="outline"
                size="icon-lg"
                className="rounded-full lg:hidden"
              >
                <MenuIcon />
                <span className="sr-only">Menu</span>
              </Button>
            }
          />
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Hero section                                */
/* -------------------------------------------------------------------------- */

const HeroSection41 = ({
  navigationData = [],
  menudata = [],
  brandName = "Firey Treat",
  headerCtaLabel = "Order now",
  eyebrow,
  heading = "Savor the taste of perfection",
  description = "Welcome to Restaurant where passion meets the plate. From sizzling appetisers to signature desserts, every dish is crafted to delight your senses.",
  primaryCtaLabel = "Order now",
  secondaryCtaLabel = "Book table",
  primaryCtaHref = "#menu-section",
  secondaryCtaHref = "#location-section",
  onPrimaryCtaClick,
  onSecondaryCtaClick,
  onDishClick,
  showHeader = true,
  autoplayDelay = 3000,
  className,
}: HeroSection41Props) => {
  const [mainApi, setMainApi] = useState<CarouselApi>()
  const [thumbApi, setThumbApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [autoplay] = useState(() =>
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  // Keep the main dish showcase and bottom side-scroll dish strip in sync.
  useEffect(() => {
    const apis = [mainApi, thumbApi]
    const cleanups: Array<() => void> = []

    apis.forEach((api) => {
      if (!api) return

      const onSelect = () => {
        const selectedIndex = api.selectedScrollSnap()

        setCurrent(selectedIndex)
        apis.forEach((other) => {
          if (other && other !== api) other.scrollTo(selectedIndex)
        })
      }

      api.on("select", onSelect)
      cleanups.push(() => api.off("select", onSelect))
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [mainApi, thumbApi])

  const handleDishSelect = useCallback(
    (item: MenuData, index: number) => {
      mainApi?.scrollTo(index)
      thumbApi?.scrollTo(index)
      setCurrent(index)
      onDishClick?.(item)
    },
    [mainApi, thumbApi, onDishClick]
  )

  return (
    <div
      className={cn(
        "relative overflow-x-hidden bg-background text-foreground border-b border-border/80",
        className
      )}
    >
      {/* Subtle warm ambient ember glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-96 w-full max-w-6xl -translate-x-1/2 bg-gradient-to-r from-red-600/10 via-amber-500/12 to-orange-600/10 blur-3xl"
      />

      {showHeader && (
        <Header
          navigationData={navigationData}
          brandName={brandName}
          ctaLabel={headerCtaLabel}
          ctaHref={secondaryCtaHref}
        />
      )}

      <div className={cn("relative flex flex-col", showHeader && "pt-17.5")}>
        <section className="flex-1 py-10 sm:py-14 lg:py-18">
          <div className="mx-auto flex h-full max-w-7xl flex-col gap-10 lg:gap-14 px-4 sm:px-6 lg:px-8">
            {/* Top Hero Row: Headline + Featured Dish Spotlight Carousel */}
            <div className="grid grid-cols-1 items-center gap-8 gap-y-12 md:gap-y-14 lg:grid-cols-5">
              <div className="flex w-full flex-col justify-center gap-5 max-lg:items-center lg:col-span-3">
                {eyebrow && (
                  <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary">
                    <Flame className="size-4 fill-current text-red-500" />
                    <span>{eyebrow}</span>
                  </div>
                )}

                <h1 className="font-display text-3xl leading-[1.15] font-black tracking-tight text-balance text-foreground max-lg:text-center sm:text-5xl lg:text-6xl">
                  {heading}
                </h1>

                <p className="max-w-xl text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground max-lg:text-center">
                  {description}
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
                  {onPrimaryCtaClick ? (
                    <Button
                      size="lg"
                      onClick={onPrimaryCtaClick}
                      className="group relative w-fit cursor-pointer overflow-hidden rounded-full text-base font-bold before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,color-mix(in_oklab,var(--color-primary-foreground)_50%,transparent)_50%,transparent_75%,transparent_100%)] before:bg-size-[250%_250%,100%_100%] before:bg-position-[200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000 hover:before:bg-position-[-100%_0,0_0]"
                    >
                      {primaryCtaLabel}
                      <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="group relative w-fit overflow-hidden rounded-full text-base font-bold before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,color-mix(in_oklab,var(--color-primary-foreground)_50%,transparent)_50%,transparent_75%,transparent_100%)] before:bg-size-[250%_250%,100%_100%] before:bg-position-[200%_0,0_0] before:bg-no-repeat before:transition-[background-position_0s_ease] before:duration-1000 hover:before:bg-position-[-100%_0,0_0]"
                      render={<a href={primaryCtaHref} />}
                      nativeButton={false}
                    >
                      {primaryCtaLabel}
                      <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  )}

                  {onSecondaryCtaClick ? (
                    <Button
                      size="lg"
                      onClick={onSecondaryCtaClick}
                      className="cursor-pointer rounded-full bg-primary/15 text-base font-semibold text-primary hover:bg-primary/25"
                    >
                      {secondaryCtaLabel}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="rounded-full bg-primary/15 text-base font-semibold text-primary hover:bg-primary/25 [a]:hover:bg-primary/25"
                      render={<a href={secondaryCtaHref} />}
                      nativeButton={false}
                    >
                      {secondaryCtaLabel}
                    </Button>
                  )}
                </div>
              </div>

              <Carousel
                className="w-full lg:col-span-2"
                setApi={setMainApi}
                plugins={[autoplay]}
                opts={{ loop: true }}
              >
                <CarouselContent>
                  {menudata.map((item, index) => (
                    <CarouselItem
                      key={item.id}
                      className="flex w-full flex-col items-center justify-center py-3"
                    >
                      <button
                        type="button"
                        onClick={() => handleDishSelect(item, index)}
                        className="group relative flex flex-col items-center justify-center cursor-pointer focus:outline-none"
                        title={`View ${item.dishTitle} in menu`}
                      >
                        <div className="absolute inset-4 rounded-full bg-primary/20 blur-2xl transition-opacity group-hover:bg-primary/30" />
                        <img
                          src={item.img}
                          alt={item.imgAlt}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = FALLBACK_DISH_IMG
                          }}
                          className="relative size-68 sm:size-82 rounded-full object-cover shadow-2xl ring-4 ring-primary/35 transition-transform duration-300 group-hover:scale-[1.03] group-hover:ring-primary"
                        />
                        <div className="relative -mt-6 flex items-center gap-2.5 rounded-full border border-primary/40 bg-card/95 px-4 py-2 shadow-xl backdrop-blur-md transition-colors group-hover:border-primary">
                          <span className="max-w-44 sm:max-w-56 truncate text-xs sm:text-sm font-bold text-foreground">
                            {item.dishTitle}
                          </span>
                          <Separator
                            orientation="vertical"
                            className="h-4! w-px! bg-border data-vertical:self-center"
                          />
                          <span className="text-xs sm:text-sm font-black text-primary shrink-0">
                            {item.dishPrice}
                          </span>
                          <ArrowRightIcon className="size-3.5 text-primary transition-transform group-hover:translate-x-0.5 shrink-0" />
                        </div>
                      </button>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            {/* Full-Width Interactive Side-Scroll Dish Strip (Synced with Live Menu) */}
            {menudata.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="font-bold uppercase tracking-wider text-foreground">
                      Our Dishes
                    </span>
                    <span>&bull;</span>
                    <span>
                      {menudata.length} items &mdash; click any dish to jump to it in the menu
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => mainApi?.scrollPrev()}
                      className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors cursor-pointer"
                      aria-label="Previous dish"
                    >
                      <ChevronLeftIcon className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => mainApi?.scrollNext()}
                      className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors cursor-pointer"
                      aria-label="Next dish"
                    >
                      <ChevronRightIcon className="size-4" />
                    </button>
                  </div>
                </div>

                <Carousel
                  className="relative w-full"
                  setApi={setThumbApi}
                  opts={{ loop: true, align: "start", dragFree: true }}
                >
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 bg-linear-to-r from-background via-background/70 to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 bg-linear-to-l from-background via-background/70 to-transparent" />
                  <CarouselContent className="py-2 flex">
                    {menudata.map((item, index) => {
                      const isActive = current === index
                      return (
                        <CarouselItem
                          key={item.id}
                          className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                        >
                          <button
                            type="button"
                            onClick={() => handleDishSelect(item, index)}
                            className={cn(
                              "group relative flex w-full flex-col items-center rounded-2xl border px-3 pt-3 pb-3.5 text-center transition-all duration-200 cursor-pointer hover:-translate-y-1",
                              isActive
                                ? "border-primary bg-card shadow-lg shadow-amber-500/10"
                                : "border-border/80 bg-card/60 hover:border-primary/50 hover:bg-card"
                            )}
                            title={`Jump to ${item.dishTitle} (${item.dishPrice}) in menu`}
                          >
                            <div className="relative mb-2.5 flex items-center justify-center">
                              <img
                                src={item.img}
                                alt={item.imgAlt}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src =
                                    FALLBACK_DISH_IMG
                                }}
                                className={cn(
                                  "size-20 sm:size-22 rounded-full object-cover shadow-md ring-2 transition-all duration-200",
                                  isActive
                                    ? "scale-105 ring-primary"
                                    : "ring-border/80 group-hover:ring-primary/60"
                                )}
                              />
                              <span className="absolute -bottom-1.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-black text-primary-foreground shadow">
                                {item.dishPrice}
                              </span>
                            </div>

                            <span className="mt-1 line-clamp-1 w-full text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                              {item.dishTitle}
                            </span>

                            {item.categoryLabel && (
                              <span className="mt-0.5 line-clamp-1 w-full text-[10px] font-medium text-muted-foreground">
                                {item.categoryLabel}
                              </span>
                            )}
                          </button>
                        </CarouselItem>
                      )
                    })}
                  </CarouselContent>
                </Carousel>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default HeroSection41
