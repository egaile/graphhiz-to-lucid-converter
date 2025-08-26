| Graphviz                     | Export (draw\.io XML)                           | Export (Lucid Standard Import)                      |
| ---------------------------- | ----------------------------------------------- | --------------------------------------------------- |
| `label`                      | `<mxCell value="...">`                          | `shape.text.label`                                  |
| `shape=box/ellipse/diamond`  | mx style `shape=rectangle/ellipse/rhombus`      | `shape.type` (flowchart rectangle/ellipse/decision) |
| `style=filled` + `fillcolor` | `fillColor=#...`                                | `style.fillColor`                                   |
| `color`                      | `strokeColor=#...`                              | `style.strokeColor`                                 |
| `penwidth`                   | `strokeWidth`                                   | `style.strokeWidth`                                 |
| `fontsize`, `fontname`       | `fontSize`, `fontFamily`                        | `text.style.fontSize/fontFamily`                    |
| `rankdir=LR/TB`              | page orientation hint; position reflects layout | page size/origin; positions reflect layout          |
| `edge.label`                 | edge `mxCell` `value="..."`                     | `line.text.label`                                   |
| `edge.style=dashed`          | `dashed=1`                                      | `style.pattern="dashed"`                            |
| subgraph/cluster             | group container                                 | group/container                                     |
