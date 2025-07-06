import type { ServerTool } from "@repo/db/types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@repo/ui/components/ui/accordion"
import { Badge } from "@repo/ui/components/ui/badge"

interface ServerToolsListProps {
  tools: ServerTool[]
}

export function ServerToolsList({ tools }: ServerToolsListProps) {
  if (!tools || tools.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">该服务器未提供工具信息</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">此服务器提供以下 {tools.length} 个工具，可以通过 MCP 协议调用：</p>

      <Accordion type="single" collapsible className="w-full">
        {tools.map((tool) => (
          <AccordionItem key={tool.id} value={tool.id}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center text-left">
                <span className="font-medium">{tool.name}</span>
                <Badge variant="outline" className="ml-2">
                  {tool.id}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <p>{tool.description}</p>

                {tool.usage && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">用法</h4>
                    <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                      <code>{tool.usage}</code>
                    </pre>
                  </div>
                )}

                {tool.parameters && tool.parameters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">参数</h4>
                    <div className="space-y-2">
                      {tool.parameters.map((param, index) => (
                        <div key={index} className="bg-muted/50 p-2 rounded-md">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{param.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {param.type}
                            </Badge>
                            {param.required && <Badge className="text-xs">必填</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tool.returns && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">返回值</h4>
                    <div className="bg-muted/50 p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {tool.returns.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{tool.returns.description}</p>
                    </div>
                  </div>
                )}

                {tool.examples && tool.examples.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">示例</h4>
                    <div className="space-y-2">
                      {tool.examples.map((example, index) => (
                        <pre key={index} className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                          <code>{example}</code>
                        </pre>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

