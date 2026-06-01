const apiUrl = '/api/products';

const state = {
  products: [],
  editingId: null,
  currentImageUrl: '',
  previewObjectUrl: ''
};

const metricsElement = document.getElementById('metrics');
const productsTableBody = document.getElementById('productsTableBody');
const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const submitButton = document.getElementById('submitButton');
const resetButton = document.getElementById('resetButton');
const statusBadge = document.getElementById('statusBadge');
const imageUrlInput = document.getElementById('imageUrl');
const imageFileInput = document.getElementById('imageFile');
const imagePreviewPanel = document.getElementById('imagePreviewPanel');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewLabel = document.getElementById('imagePreviewLabel');

function releasePreviewObjectUrl() {
  if (!state.previewObjectUrl) {
    return;
  }

  URL.revokeObjectURL(state.previewObjectUrl);
  state.previewObjectUrl = '';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(Number(value) || 0);
}

function setStatus(message, tone = 'neutral') {
  statusBadge.textContent = message;
  statusBadge.dataset.tone = tone;
}

function getStockState(stock) {
  if (stock <= 5) {
    return { label: 'Bajo', state: 'low' };
  }

  if (stock <= 15) {
    return { label: 'Medio', state: 'medium' };
  }

  return { label: 'Disponible', state: 'high' };
}

async function request(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(options.headers || {})
  };

  if (options.body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const details = Array.isArray(data?.details) ? ` ${data.details.join(' ')}` : '';
    throw new Error(`${data?.message || 'No se pudo completar la solicitud.'}${details}`.trim());
  }

  return data;
}

function renderMetrics() {
  const totalProducts = state.products.length;
  const totalStock = state.products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const totalValue = state.products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
    0
  );

  metricsElement.innerHTML = `
    <article class="metric-card">
      <span>Productos</span>
      <strong>${totalProducts}</strong>
    </article>
    <article class="metric-card">
      <span>Stock total</span>
      <strong>${totalStock}</strong>
    </article>
    <article class="metric-card">
      <span>Valor</span>
      <strong>${formatCurrency(totalValue)}</strong>
    </article>
  `;
}

function renderImagePreview(source = '') {
  if (!source) {
    imagePreviewPanel.dataset.state = 'empty';
    imagePreview.removeAttribute('src');
    imagePreviewLabel.textContent = 'Sin imagen seleccionada';
    return;
  }

  imagePreviewPanel.dataset.state = 'filled';
  imagePreview.src = source;
  imagePreviewLabel.textContent = 'Vista previa';
}

function updateImagePreview() {
  releasePreviewObjectUrl();

  const selectedFile = imageFileInput.files?.[0];

  if (selectedFile) {
    state.previewObjectUrl = URL.createObjectURL(selectedFile);
    renderImagePreview(state.previewObjectUrl);
    return;
  }

  const imageUrl = imageUrlInput.value.trim();

  if (imageUrl) {
    renderImagePreview(imageUrl);
    return;
  }

  renderImagePreview(state.currentImageUrl);
}

function buildProductFormData() {
  const formData = new FormData();

  formData.append('name', productForm.name.value.trim());
  formData.append('description', productForm.description.value.trim());
  formData.append('price', productForm.price.value);
  formData.append('stock', productForm.stock.value);
  formData.append('image_url', imageUrlInput.value.trim());

  if (imageFileInput.files?.[0]) {
    formData.append('image_file', imageFileInput.files[0]);
  }

  return formData;
}

function renderProducts() {
  if (!state.products.length) {
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">No hay productos registrados.</td>
      </tr>
    `;
    return;
  }

  productsTableBody.innerHTML = state.products
    .map((product) => {
      const stock = getStockState(Number(product.stock));

      return `
        <tr>
          <td>
            <div class="product-cell">
              <img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}" />
              <div>
                <strong>${escapeHtml(product.name)}</strong>
                <p>${escapeHtml(product.description)}</p>
              </div>
            </div>
          </td>
          <td>${formatCurrency(product.price)}</td>
          <td>${escapeHtml(product.stock)}</td>
          <td>
            <span class="stock-badge" data-state="${stock.state}">${stock.label}</span>
          </td>
          <td>
            <div class="actions-cell">
              <button type="button" class="table-button" data-action="edit" data-id="${product.id}" data-variant="edit">Editar</button>
              <button type="button" class="table-button" data-action="delete" data-id="${product.id}" data-variant="delete">Eliminar</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function resetFormState() {
  state.editingId = null;
  state.currentImageUrl = '';
  releasePreviewObjectUrl();
  productForm.reset();
  formTitle.textContent = 'Registrar producto';
  submitButton.textContent = 'Registrar';
  renderImagePreview();
}

function fillForm(product) {
  state.editingId = product.id;
  state.currentImageUrl = product.image_url || '';
  productForm.name.value = product.name;
  productForm.description.value = product.description;
  productForm.price.value = product.price;
  productForm.stock.value = product.stock;
  imageFileInput.value = '';
  imageUrlInput.value = /^https?:\/\//i.test(product.image_url || '') ? product.image_url : '';
  formTitle.textContent = 'Actualizar producto';
  submitButton.textContent = 'Guardar cambios';
  updateImagePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadProducts() {
  setStatus('Sincronizando');

  try {
    state.products = await request(apiUrl, { headers: {} });
    renderMetrics();
    renderProducts();
    setStatus('Actualizado', 'success');
  } catch (error) {
    renderMetrics();
    productsTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">${escapeHtml(error.message)}</td>
      </tr>
    `;
    setStatus('Error', 'danger');
  }
}

productForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = buildProductFormData();

  try {
    if (state.editingId) {
      await request(`${apiUrl}/${state.editingId}`, {
        method: 'PUT',
        body: payload
      });
      setStatus('Producto actualizado', 'success');
    } else {
      await request(apiUrl, {
        method: 'POST',
        body: payload
      });
      setStatus('Producto registrado', 'success');
    }

    resetFormState();
    await loadProducts();
  } catch (error) {
    setStatus(error.message, 'danger');
  }
});

productsTableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');

  if (!button) {
    return;
  }

  const productId = Number(button.dataset.id);
  const product = state.products.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  if (button.dataset.action === 'edit') {
    fillForm(product);
    return;
  }

  if (button.dataset.action === 'delete') {
    const confirmed = window.confirm(`Se eliminará ${product.name}.`);

    if (!confirmed) {
      return;
    }

    try {
      await request(`${apiUrl}/${productId}`, {
        method: 'DELETE',
        headers: {}
      });
      resetFormState();
      await loadProducts();
      setStatus('Producto eliminado', 'success');
    } catch (error) {
      setStatus(error.message, 'danger');
    }
  }
});

resetButton.addEventListener('click', () => {
  resetFormState();
  setStatus('Listo');
});

imageUrlInput.addEventListener('input', () => {
  if (imageUrlInput.value.trim()) {
    imageFileInput.value = '';
  }

  updateImagePreview();
});

imageFileInput.addEventListener('change', () => {
  if (imageFileInput.files?.length) {
    imageUrlInput.value = '';
  }

  updateImagePreview();
});

imagePreview.addEventListener('error', () => {
  imagePreviewPanel.dataset.state = 'empty';
  imagePreview.removeAttribute('src');
  imagePreviewLabel.textContent = 'No se pudo cargar la imagen';
});

window.addEventListener('beforeunload', releasePreviewObjectUrl);

renderMetrics();
renderProducts();
renderImagePreview();
loadProducts();