import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

declare global {
    interface Window {
        katex: any;
    }
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  enableMath?: boolean; 
}

/**
 * Strict HTML sanitizer using DOMPurify (industry standard).
 * Only allows safe Markdown-generated tags and KaTeX rendering elements.
 */
function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
      'code', 'pre', 'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'sup', 'sub',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel', 'width', 'height',
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className,
  enableMath = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!content || !containerRef.current) return;
    
    const renderMarkdown = async () => {
      if (containerRef.current) {
        try {
          // Remove '$' symbols when math rendering is disabled
          const processedContent = enableMath 
  ? content 
  : content.replace(/\$/g, '').replace(/\\text\{([^}]*)\}/g, '$1');
          
          const rawHtml = await marked.parse(processedContent, { 
            gfm: true, 
            breaks: true 
          });
          
          // Sanitize HTML to prevent XSS
          const renderedHtml = sanitizeHtml(rawHtml);

          if (containerRef.current) {
            containerRef.current.innerHTML = renderedHtml;

            // Handle broken images gracefully
            const images = containerRef.current.querySelectorAll('img');
            images.forEach(img => {
                img.onerror = () => {
                    const errorContainer = document.createElement('div');
                    errorContainer.className = 'p-3 my-2 bg-yellow-50 border border-yellow-300 rounded-md text-center text-sm';
                    
                    const errorText = document.createElement('p');
                    errorText.textContent = '⚠️ No se pudo cargar una imagen en esta explicación.';
                    errorText.className = 'text-yellow-800 font-semibold';
                    
                    const errorSubText = document.createElement('p');
                    errorSubText.textContent = 'A veces, las imágenes sugeridas por la IA no están disponibles. Puedes continuar con la lectura.';
                    errorSubText.className = 'text-yellow-700 mt-1';
                    
                    errorContainer.appendChild(errorText);
                    errorContainer.appendChild(errorSubText);
                    
                    img.parentNode?.replaceChild(errorContainer, img);
                };
            });

            // Only process for KaTeX if math is explicitly enabled
            if (enableMath && window.katex) {
              const renderMathInElement = (elem: HTMLElement) => {
                const walker = document.createTreeWalker(
                  elem, 
                  NodeFilter.SHOW_TEXT
                );
                let currentNode = walker.nextNode();
                
                while(currentNode) {
                    const node = currentNode;
                    currentNode = walker.nextNode();

                    let text = node.textContent || '';
                    const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^$\s][^$]*?\$)/g;
                    if(!text.match(mathRegex)) continue;

                    const fragment = document.createDocumentFragment();
                    let lastIndex = 0;

                    text.replace(mathRegex, (match, _content, offset) => {
                        if (offset > lastIndex) {
                            fragment.appendChild(
                              document.createTextNode(text.slice(lastIndex, offset))
                            );
                        }
                        
                        try {
                            const mathSpan = document.createElement('span');
                            const displayMode = match.startsWith('$$');
                            const latex = match.slice(
                              displayMode ? 2 : 1, 
                              -(displayMode ? 2 : 1)
                            );
                            window.katex.render(latex, mathSpan, {
                                throwOnError: false,
                                displayMode: displayMode,
                            });
                            fragment.appendChild(mathSpan);
                        } catch (e) {
                            console.error('KaTeX rendering error:', e);
                            fragment.appendChild(document.createTextNode(match));
                        }
                        
                        lastIndex = offset + match.length;
                        return match;
                    });

                    if (lastIndex < text.length) {
                        fragment.appendChild(
                          document.createTextNode(text.slice(lastIndex))
                        );
                    }
                    
                    node.parentNode?.replaceChild(fragment, node);
                }
              };
              renderMathInElement(containerRef.current);
            }
          }
        } catch (error) {
          console.error("Error rendering content:", error);
          if (containerRef.current) {
            containerRef.current.textContent = content;
          }
        }
      }
    };
    renderMarkdown();
  }, [content, enableMath]);

  return <div ref={containerRef} className={`markdown-content ${className || ''}`} />;
};

export default MarkdownRenderer;
