const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const port = process.env.PORT || 10000;

// Configurazione Stripe con la tua chiave Live
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Connessione al Database PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());

// NOTA IMPORTANTE: Il webhook di Stripe ha bisogno del raw body, quindi lo gestiamo prima di express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Se usi un webhook secret, puoi inserirlo qui. Per ora gestiamo l'evento base.
    event = JSON.parse(req.body.toString());
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gestione dell'evento di pagamento completato
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Pagamento completato con successo per la sessione:', session.id);
    // Qui puoi aggiungere la logica per aggiornare il database (es. dare crediti o attivare l'utente)
  }

  res.json({ received: true });
});

app.use(express.json());

// Rotta di test per verificare che il server sia online
app.get('/', (req, res) => {
  res.json({ status: 'RankWars Backend is online and running!' });
});

// Avvio del server
app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
});