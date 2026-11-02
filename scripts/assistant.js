export function setupAssistant() {
  const root = document.createElement('aside');
  root.className = 'assistant';
  root.setAttribute('aria-label', 'Asisten tanya jawab');
  root.innerHTML = `<section class="assistant-panel" id="assistant-panel" aria-labelledby="assistant-title" hidden>
    <header class="assistant-header"><div><h2 id="assistant-title">Tanya Hasta</h2><p>FAQ arsitektur Bali</p></div><button type="button" class="assistant-close" aria-label="Tutup asisten">×</button></header>
    <div class="assistant-messages" aria-live="polite"><p>Pilih topik atau tulis pertanyaan tentang arsitektur Bali.</p></div>
    <div class="assistant-topics" role="group" aria-label="Pertanyaan cepat"><button type="button" data-query="Kaja Selatan">Kaja dan Kelod</button><button type="button" data-query="Tri Mandala Sanga Mandala">Sanga Mandala</button><button type="button" data-query="mengukur satu Hasta">Ukuran hasta</button></div>
    <form class="assistant-form"><label class="sr-only" for="assistant-input">Pertanyaan</label><input id="assistant-input" type="search" placeholder="Tulis pertanyaan" autocomplete="off"><button type="submit">Kirim</button></form>
    <p class="assistant-note">Jawaban terkurasi, bukan percakapan AI. <a href="./edukasi.html#faq">Lihat semua tanya jawab</a></p>
  </section><button type="button" class="assistant-toggle" aria-expanded="false" aria-controls="assistant-panel"><img src="./assets/favicon.png" alt="" width="28" height="28"> Tanya Hasta</button>`;
  document.body.append(root);
  const panel = root.querySelector('.assistant-panel');
  const toggle = root.querySelector('.assistant-toggle');
  const close = root.querySelector('.assistant-close');
  const messages = root.querySelector('.assistant-messages');
  const input = root.querySelector('input');
  const ignored = new Set(['apa', 'itu', 'dan', 'yang', 'bagaimana', 'cara', 'untuk', 'pada', 'dari', 'mengapa', 'bali', 'saya', 'tolong', 'bisa', 'tentang', 'arsitektur', 'tradisional', 'bangunan']);
  let items;

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    (open ? input : toggle).focus();
  }
  async function loadItems() {
    if (items) return items;
    const response = await fetch('./edukasi.html');
    if (!response.ok) throw new Error('Materi tidak tersedia');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    items = [...doc.querySelectorAll('#faq details')].map(detail => ({
      question: detail.querySelector('summary').textContent.trim(),
      answer: detail.querySelector('p').textContent.replace(/\[B-\d+\]/g, '').trim(),
      sources: [...detail.querySelectorAll('a.citation')].map(a => ({ label: a.textContent.trim(), href: `./edukasi.html${a.getAttribute('href')}` }))
    }));
    return items;
  }
  function append(text, type) {
    const p = document.createElement('p');
    p.className = `assistant-message ${type}`;
    p.textContent = text;
    messages.append(p);
    return p;
  }
  async function ask(query) {
    query = query.trim();
    if (!query) return;
    append(query, 'user');
    input.value = '';
    try {
      const data = await loadItems();
      const words = query.toLowerCase().match(/[a-z0-9]+/g) || [];
      const terms = [...new Set(words.filter(word => word.length > 2 && !ignored.has(word)))];
      const ranked = data.map(item => ({ item, score: terms.filter(word => item.question.toLowerCase().includes(word)).length })).sort((a,b) => b.score-a.score);
      if (!ranked[0]?.score || ranked[0].score / terms.length < 2 / 3) {
        append('Saya belum menemukan jawaban yang sesuai. Coba gunakan kata kunci seperti kaja, hasta, atau Tri Angga.', 'bot');
      } else {
        const { item } = ranked[0];
        const bubble = append(`${item.question}\n\n${item.answer}`, 'bot');
        item.sources.forEach(source => { const a = document.createElement('a'); a.href = source.href; a.textContent = ` ${source.label}`; bubble.append(a); });
      }
    } catch {
      append('Materi belum dapat dimuat. Buka halaman Edukasi untuk membaca tanya jawab.', 'bot');
    }
    messages.scrollTop = messages.scrollHeight;
  }
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false));
  root.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) setOpen(false); });
  root.querySelector('form').addEventListener('submit', event => { event.preventDefault(); ask(input.value); });
  root.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => ask(button.dataset.query)));
}
