
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

// ChartContext and useChart are removed as ResponsiveContainer handles responsiveness directly.

// ChartContainer is removed, use RechartsPrimitive.ResponsiveContainer directly

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  // Make config optional or remove its usage if not needed from context anymore
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
      config?: ChartConfig // Make config optional prop if needed directly
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      config // Receive config as prop if needed
    },
    ref
  ) => {
    // const { config } = useChart() // Removed context usage

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      // Use provided config or default label if config is missing
      const itemConfig = config ? getPayloadConfigFromPayload(config, item, key) : undefined;
      const value =
        !labelKey && typeof label === "string"
          ? (config && config[label as keyof typeof config]?.label) || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(label, payload)} {/* Pass original label to formatter */}
          </div>
        )
      }

      if (!value) {
        return null
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      config, // Depend on passed config
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            // Use provided config or default label if config is missing
            const itemConfig = config ? getPayloadConfigFromPayload(config, item, key) : undefined;
            const indicatorColor = color || item.payload.fill || item.color || item.stroke; // Added item.stroke

            // Allow formatter to completely override the display
             if (formatter) {
                const formattedContent = formatter(item.value, item.name, item, index, item.payload);
                 // If formatter returns null/undefined, skip rendering this item
                if (formattedContent === null || formattedContent === undefined) {
                    return null;
                }
                // If formatter returns a React node, render it directly
                if (React.isValidElement(formattedContent)) {
                   return <div key={item.dataKey || index}>{formattedContent}</div>;
                }
                // Otherwise, assume it's simple content to wrap
                 return (
                   <div
                     key={item.dataKey || index}
                     className={cn(
                       "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                       indicator === "dot" && "items-center"
                     )}
                   >
                     {/* Render indicator */}
                     {!hideIndicator && (
                       <div
                         className={cn(
                           "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                           {
                             "h-2.5 w-2.5": indicator === "dot",
                             "w-1": indicator === "line",
                             "w-0 border-[1.5px] border-dashed bg-transparent":
                               indicator === "dashed",
                             "my-0.5": nestLabel && indicator === "dashed",
                           }
                         )}
                         style={
                           {
                             "--color-bg": indicatorColor,
                             "--color-border": indicatorColor,
                           } as React.CSSProperties
                         }
                       />
                     )}
                     {/* Render the formatted content */}
                     <div className={cn("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center")}>
                        {formattedContent}
                     </div>
                   </div>
                 );
             }

             // Default rendering if no formatter or formatter didn't return a node/null
             return (
              <div
                key={item.dataKey || index} // Use index as fallback key
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {itemConfig?.icon ? (
                  <itemConfig.icon />
                ) : (
                  !hideIndicator && (
                    <div
                      className={cn(
                        "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                        {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent":
                            indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed",
                        }
                      )}
                      style={
                        {
                          "--color-bg": indicatorColor,
                          "--color-border": indicatorColor,
                        } as React.CSSProperties
                      }
                    />
                  )
                )}
                <div
                  className={cn(
                    "flex flex-1 justify-between leading-none",
                    nestLabel ? "items-end" : "items-center"
                  )}
                >
                  <div className="grid gap-1.5">
                    {nestLabel ? tooltipLabel : null}
                    <span className="text-muted-foreground">
                       {/* Use item.name directly if label is missing */}
                       {itemConfig?.label || item.name}
                    </span>
                  </div>
                  {item.value !== undefined && item.value !== null && ( // Check for null/undefined
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {/* Check if value is number before calling toLocaleString */}
                      {typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent" // Corrected display name

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
      config?: ChartConfig // Make config optional prop if needed directly
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey, config },
    ref
  ) => {
    // const { config } = useChart() // Removed context usage

    if (!payload?.length || !config) { // Need config to render labels
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          // Skip legend item if no config found
          if (!itemConfig) return null;

          return (
            <div
              key={item.value} // Use item.value as key
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {/* Use itemConfig.label, fallback to item.value if label missing */}
              {itemConfig?.label || item.value}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegendContent" // Corrected display name

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
): ChartConfig[string] | undefined { // Added return type annotation
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  // ChartContainer removed
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
