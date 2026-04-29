const regex = /(\$\$[\s\S]+?\$\$|\$[^$\s][^$]*?\$)/g;
const text = 'miden $$20$$ cm';
let lastIndex = 0;
const parts = [];
text.replace(regex, (match, _content, offset) => {
  if (offset > lastIndex) {
    parts.push(text.slice(lastIndex, offset));
  }
  parts.push('MATH:' + match);
  lastIndex = offset + match.length;
  return match;
});
if (lastIndex < text.length) {
  parts.push(text.slice(lastIndex));
}
console.log(parts);
