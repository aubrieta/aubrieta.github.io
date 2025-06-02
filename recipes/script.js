let allRecipes = [];

fetch('recipes.json')
  .then(response => response.json())
  .then(data => {
    allRecipes = data;
    route();
  });

window.addEventListener('hashchange', route);

function route() {
  const hash = decodeURIComponent(location.hash.slice(1)); // remove '#' and decode
  if (hash) {
    const recipe = allRecipes.find(r => slugify(r.title) === hash);
    if (recipe) {
      renderRecipe(recipe);
    } else {
      renderNotFound();
    }
  } else {
    renderRecipeList();
  }
}

function renderRecipeList() {
    const container = document.getElementById('recipes-container');
    container.innerHTML = '<h1>recipes</h1>';
  
    // Group recipes by category
    const categories = {};
    allRecipes.forEach(recipe => {
      const category = recipe.category || 'uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(recipe);
    });
  
    // Render each category section
    Object.entries(categories).forEach(([category, recipes]) => {
      const sectionTitle = document.createElement('h2');
      sectionTitle.textContent = category;
      sectionTitle.style.marginTop = '2rem';
      container.appendChild(sectionTitle);
  
      const list = document.createElement('ul');
      list.style.listStyle = 'none';
      list.style.paddingLeft = '0';
  
      recipes.forEach(recipe => {
        const item = document.createElement('li');
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '0.5rem';
        item.style.marginBottom = '0.5rem';

        if (recipe.subcategory) {
        const tag = document.createElement('span');
        tag.textContent = recipe.subcategory;
        tag.style.padding = '2px 8px';
        tag.style.borderRadius = '12px';
        tag.style.backgroundColor = 'rgba(210, 192, 168, 0.4)';
        tag.style.color = '#654321';
        tag.style.fontSize = '0.8rem';
        tag.style.fontStyle = 'normal';
        tag.style.flexShrink = '0';
        item.appendChild(tag);
        }

        const link = document.createElement('a');
        link.href = `#${slugify(recipe.title)}`;
        link.textContent = recipe.title;
        link.style.fontSize = '1rem';
        link.style.display = 'inline-block';

        item.appendChild(link);
        list.appendChild(item);
      });
  
      container.appendChild(list);
    });
}
  

function renderRecipe(recipe) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  const backLink = document.createElement('a');
  backLink.href = '#';
  backLink.textContent = 'back to recipes';
  backLink.style.display = 'inline-block';
  backLink.style.marginBottom = '1rem';
  container.appendChild(backLink);

  const card = document.createElement('div');
  card.className = 'recipe-card';

  const title = document.createElement('h2');
  title.textContent = recipe.title;

  const grid = document.createElement('div');
  grid.className = 'recipe-grid';

  // INGREDIENTS
  const ingredientsCol = document.createElement('div');
  ingredientsCol.className = 'ingredients-column';
  const ingTitle = document.createElement('h3');
  ingTitle.textContent = 'ingredients';
  ingredientsCol.appendChild(ingTitle);

  if (recipe.ingredientGroups) {
    recipe.ingredientGroups.forEach(group => {
      const groupLabel = document.createElement('h4');
      groupLabel.textContent = group.label;
      ingredientsCol.appendChild(groupLabel);
      group.items.forEach(ing => {
        ingredientsCol.appendChild(renderIngredient(ing));
      });
    });
  } else if (recipe.ingredients) {
    recipe.ingredients.forEach(ing => {
      ingredientsCol.appendChild(renderIngredient(ing));
    });
  }

  // INSTRUCTIONS
  const instructionsCol = document.createElement('div');
  instructionsCol.className = 'instructions-column';
  const instrTitle = document.createElement('h3');
  instrTitle.textContent = 'instructions';
  instructionsCol.appendChild(instrTitle);

  if (recipe.steps) {
    const ol = document.createElement('ol');
    recipe.steps.forEach(text => {
      const li = document.createElement('li');
      li.innerHTML = text.replace(/\[([^\]]+)\]/g, (_, tag) => {
        return `<span class="ingredient-ref" data-ref="${tag}">${tag}</span>`;
      });
      ol.appendChild(li);
    });
    instructionsCol.appendChild(ol);
  } else if (recipe.instructions) {
    const p = document.createElement('p');
    p.innerHTML = recipe.instructions.replace(/\[([^\]]+)\]/g, (_, tag) => {
      return `<span class="ingredient-ref" data-ref="${tag}">${tag}</span>`;
    });
    instructionsCol.appendChild(p);
  }

  // Assemble
  grid.appendChild(ingredientsCol);
  grid.appendChild(instructionsCol);
  card.appendChild(title);
  card.appendChild(grid);
  container.appendChild(card);
}

function renderIngredient(ing) {
  const item = document.createElement('div');
  item.className = 'ingredient-item';

  if (ing.quantity) {
    const quantity = document.createElement('span');
    quantity.className = 'quantity';
    quantity.textContent = ing.quantity;
    item.appendChild(quantity);
  }

  const name = document.createElement('span');
  name.className = 'name-tag';
  name.textContent = ing.name;
  name.dataset.tag = ing.name;

  name.addEventListener('mouseenter', () => {
    document.querySelectorAll(`[data-ref="${ing.name}"]`).forEach(ref => {
      ref.classList.add('highlight');
    });
  });

  name.addEventListener('mouseleave', () => {
    document.querySelectorAll(`[data-ref="${ing.name}"]`).forEach(ref => {
      ref.classList.remove('highlight');
    });
  });

  item.appendChild(name);

  if (ing.type || ing.note) {
    const meta = document.createElement('span');
    meta.className = 'meta-tag';
    meta.textContent = ing.type || ing.note;
    item.appendChild(meta);
  }

  return item;
}

function renderNotFound() {
  const container = document.getElementById('recipes-container');
  container.innerHTML = `
    <h2>Recipe not found</h2>
    <a href="#">back to recipes</a>
  `;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
}
