// Motor del modelo en el navegador (WebLLM). Corre 100% en el dispositivo
// del usuario vía WebGPU — sin costo de servidor, sin límite de cuota.

let enginePromise = null
let currentModel = null

const MODEL_PRIMARY = 'Llama-3.2-3B-Instruct-q4f16_1-MLC'
const MODEL_FALLBACK = 'Llama-3.2-1B-Instruct-q4f16_1-MLC'

export function isWebGPUSupported() {
  return typeof navigator !== 'undefined' && !!navigator.gpu
}

async function ensurePersistentStorage() {
  if (!navigator.storage) return

  if (navigator.storage.estimate) {
    const { usage, quota } = await navigator.storage.estimate()
    console.log(`[webllm] Cuota actual: ${(usage / 1e6).toFixed(1)}MB usados de ${(quota / 1e6).toFixed(1)}MB`)
  }

  if (navigator.storage.persist) {
    const granted = await navigator.storage.persist()
    console.log(`[webllm] Almacenamiento persistente: ${granted ? 'concedido' : 'denegado'}`)
  }
}

export async function getEngine(onProgress) {
  if (enginePromise) return enginePromise

  enginePromise = (async () => {
    await ensurePersistentStorage()

    const webllm = await import('@mlc-ai/web-llm')

    const initProgressCallback = (report) => {
      if (onProgress) onProgress(report.progress ?? 0, report.text ?? '')
    }

    try {
      currentModel = MODEL_PRIMARY
      return await webllm.CreateMLCEngine(MODEL_PRIMARY, { initProgressCallback })
    } catch (err) {
      console.warn('[webllm] Modelo 3B falló, probando 1B:', err)
      currentModel = MODEL_FALLBACK
      return await webllm.CreateMLCEngine(MODEL_FALLBACK, { initProgressCallback })
    }
  })()

  return enginePromise
}

export function getCurrentModel() {
  return currentModel
}
