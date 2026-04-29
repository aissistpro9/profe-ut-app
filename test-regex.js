const regex = /(\$\$[\s\S]+?\$\$|\$[^$\s][^$]*?\$)/g;
const text2 = 'miden $$20$$ cm';
let match;
while ((match = regex.exec(text2)) !== null) {
  console.log(match[0], match.index);
}
