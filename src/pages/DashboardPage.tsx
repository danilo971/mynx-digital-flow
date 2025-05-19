
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

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
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
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
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
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item?.dataKey || item?.name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
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
      config,
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
            const key = `${nameKey || item?.name || item?.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item?.payload?.fill || item?.color

            return (
              <div
                key={item?.dataKey?.toString() || index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item?.name ? (
                  formatter(item.value, item.name, item, index, item?.payload)
                ) : (
                  <>
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
                          {itemConfig?.label || item?.name}
                        </span>
                      </div>
                      {item?.value && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  (
    { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
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
          const key = `${nameKey || item?.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div
              key={item?.value}
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
                    backgroundColor: item?.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegendContent.displayName = "ChartLegend"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
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

// Add the AreaChart component
const AreaChart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChartContainer> & {
    data: Record<string, unknown>[]
    categories: string[]
    index: string
    colors?: string[]
    valueFormatter?: (value: number) => string
    className?: string
  }
>(
  (
    {
      data,
      categories,
      colors = ["#2563eb", "#f59e0b", "#4ade80"],
      index,
      valueFormatter = (value: number) => `${value}`,
      ...props
    },
    ref
  ) => {
    const categoryColors = React.useMemo(() => {
      return Object.fromEntries(
        categories.map((category, i) => [
          category,
          { color: colors[i % colors.length] },
        ])
      )
    }, [categories, colors])

    return (
      <ChartContainer
        ref={ref}
        {...props}
        config={categoryColors}
      >
        <RechartsPrimitive.AreaChart data={data}>
          <defs>
            {categories.map((category, i) => (
              <linearGradient
                key={category}
                id={`gradient-${category}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={colors[i % colors.length]}
                  stopOpacity={0.45}
                />
                <stop
                  offset="100%"
                  stopColor={colors[i % colors.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <RechartsPrimitive.XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
          />
          <RechartsPrimitive.YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
          <RechartsPrimitive.Tooltip
            content={
              <ChartTooltipContent
                labelFormatter={value => (
                  <span className="font-medium">
                    {value as React.ReactNode}
                  </span>
                )}
                formatter={(value, _, __, ___, item) => {
                  // Using any here for Recharts compatibility
                  const itemData = item as any;
                  return (
                  <div className="flex w-full flex-wrap items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: colors[
                          categories.findIndex(
                            category => String(category) === String(itemData.dataKey)
                          ) % colors.length
                        ]
                      }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <span className="font-medium text-muted-foreground">
                        {itemData.dataKey}
                      </span>
                      <span className="font-medium tabular-nums">
                        {valueFormatter(value as number)}
                      </span>
                    </div>
                  </div>
                )}}
              />
            }
          />
          {categories.map((category, i) => (
            <RechartsPrimitive.Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId={1}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              fill={`url(#gradient-${category})`}
            />
          ))}
        </RechartsPrimitive.AreaChart>
      </ChartContainer>
    )
  }
)
AreaChart.displayName = "AreaChart"

// Add the BarChart component
const BarChart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChartContainer> & {
    data: Record<string, unknown>[]
    categories: string[]
    index: string
    colors?: string[]
    valueFormatter?: (value: number) => string
    className?: string
  }
>(
  (
    {
      data,
      categories,
      colors = ["#2563eb", "#f59e0b", "#4ade80"],
      index,
      valueFormatter = (value: number) => `${value}`,
      ...props
    },
    ref
  ) => {
    const categoryColors = React.useMemo(() => {
      return Object.fromEntries(
        categories.map((category, i) => [
          category,
          { color: colors[i % colors.length] },
        ])
      )
    }, [categories, colors])

    return (
      <ChartContainer
        ref={ref}
        {...props}
        config={categoryColors}
      >
        <RechartsPrimitive.BarChart data={data}>
          <RechartsPrimitive.CartesianGrid
            strokeDasharray="3 3"
            stroke="#ccc"
          />
          <RechartsPrimitive.XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
          />
          <RechartsPrimitive.YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={valueFormatter}
          />
          <RechartsPrimitive.Tooltip
            content={
              <ChartTooltipContent
                labelFormatter={value => (
                  <span className="font-medium">
                    {value as React.ReactNode}
                  </span>
                )}
                formatter={(value, _, __, ___, item) => {
                  // Using any here for Recharts compatibility
                  const itemData = item as any;
                  return (
                  <div className="flex w-full flex-wrap items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: colors[
                          categories.findIndex(
                            category => String(category) === String(itemData.dataKey)
                          ) % colors.length
                        ]
                      }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <span className="font-medium text-muted-foreground">
                        {itemData.dataKey}
                      </span>
                      <span className="font-medium tabular-nums">
                        {valueFormatter(value as number)}
                      </span>
                    </div>
                  </div>
                )}}
              />
            }
          />
          {categories.map((category, i) => (
            <RechartsPrimitive.Bar
              key={category}
              dataKey={category}
              fill={colors[i % colors.length]}
            />
          ))}
        </RechartsPrimitive.BarChart>
      </ChartContainer>
    )
  }
)
BarChart.displayName = "BarChart"

// Add the PieChart component
const PieChart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof ChartContainer> & {
    data: Record<string, unknown>[]
    category: string
    index: string
    colors?: string[]
    valueFormatter?: (value: number) => string
    className?: string
  }
>(
  (
    {
      data,
      category,
      index,
      colors = ["#2563eb", "#f59e0b", "#4ade80", "#8b5cf6", "#ec4899"],
      valueFormatter = (value: number) => `${value}`,
      ...props
    },
    ref
  ) => {
    const indexValues = React.useMemo(() => {
      return data.map(item => item[index] as string)
    }, [data, index])

    const indexColors = React.useMemo(() => {
      return Object.fromEntries(
        indexValues.map((indexValue, i) => [
          indexValue,
          { color: colors[i % colors.length] },
        ])
      )
    }, [indexValues, colors])

    return (
      <ChartContainer
        ref={ref}
        {...props}
        config={indexColors}
      >
        <RechartsPrimitive.PieChart>
          <RechartsPrimitive.Pie
            data={data}
            dataKey={category}
            nameKey={index}
            cx="50%"
            cy="50%"
            outerRadius="90%"
            innerRadius="60%"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <RechartsPrimitive.Cell
                key={`cell-${i}`}
                fill={colors[i % colors.length]}
              />
            ))}
          </RechartsPrimitive.Pie>
          <RechartsPrimitive.Tooltip
            content={
              <ChartTooltipContent
                labelKey={index}
                nameKey={index}
                formatter={(value, name) => (
                  <div className="flex w-full flex-wrap items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: colors[
                          indexValues.findIndex(i => i === name) % colors.length
                        ]
                      }}
                    />
                    <div className="flex flex-1 items-center justify-between gap-2">
                      <span className="font-medium text-muted-foreground">
                        {name}
                      </span>
                      <span className="font-medium tabular-nums">
                        {valueFormatter(value as number)}
                      </span>
                    </div>
                  </div>
                )}
              />
            }
          />
        </RechartsPrimitive.PieChart>
      </ChartContainer>
    )
  }
)
PieChart.displayName = "PieChart"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  AreaChart,
  BarChart,
  PieChart
}

// Create a simple Dashboard component
const Dashboard = () => {
  // Example data for dashboard
  const salesData = [
    { name: "Jan", Sales: 400, Profit: 240 },
    { name: "Feb", Sales: 300, Profit: 180 },
    { name: "Mar", Sales: 200, Profit: 120 },
    { name: "Apr", Sales: 278, Profit: 167 },
    { name: "May", Sales: 189, Profit: 113 },
    { name: "Jun", Sales: 239, Profit: 143 },
  ];

  const categoryColors = React.useMemo(() => {
    return {
      Sales: { color: "#2563eb" },
      Profit: { color: "#4ade80" }
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-2">Sales Overview</h2>
          <ChartContainer
            config={categoryColors}
            className="h-[300px]"
          >
            <RechartsPrimitive.AreaChart data={salesData}>
              <defs>
                <linearGradient id="gradient-Sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradient-Profit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <RechartsPrimitive.XAxis dataKey="name" tickLine={false} axisLine={false} />
              <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
              <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
              <RechartsPrimitive.Area
                type="monotone"
                dataKey="Sales"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#gradient-Sales)"
              />
              <RechartsPrimitive.Area
                type="monotone"
                dataKey="Profit"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#gradient-Profit)"
              />
            </RechartsPrimitive.AreaChart>
          </ChartContainer>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Monthly Performance</h2>
          <ChartContainer
            config={categoryColors}
            className="h-[300px]"
          >
            <RechartsPrimitive.BarChart data={salesData}>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <RechartsPrimitive.XAxis dataKey="name" tickLine={false} axisLine={false} />
              <RechartsPrimitive.YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
              <RechartsPrimitive.Tooltip content={<ChartTooltipContent />} />
              <RechartsPrimitive.Bar dataKey="Sales" fill="#2563eb" />
              <RechartsPrimitive.Bar dataKey="Profit" fill="#4ade80" />
            </RechartsPrimitive.BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
