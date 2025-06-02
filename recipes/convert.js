const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const dir = path.join(__dirname, 'markdown');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

const recipes = files.map(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const { data } = matter(content);

  return {
    title: data.title,
    category: data.category || '',
    subcategory: data.subcategory || '',
    ingredientGroups: data.ingredientGroups || [],
    steps: data.steps || []
  };
}).filter(recipe => recipe && recipe.title); // ✅ filter out bad entries

fs.writeFileSync('recipes.json', JSON.stringify(recipes, null, 2));
console.log('✅ recipes.json created with', recipes.length, 'recipes.');
