# Invoicing Systems & History

Each billing event records paid invoices and exports downloadable PDFs.

---

## Listing Invoices

Retrieve paid invoice logs using the unified `BillingService`:

```typescript
const billing = getGlobalBillingService();
const invoices = await billing.listInvoices("cust_123");

invoices.forEach((inv) => {
  console.log(`Invoice #${inv.number} Status: ${inv.status} Total: $${inv.amountPaid / 100}`);
});
```

---

## Downloading Invoices

Retrieve secure PDF download links:

```typescript
const pdfUrl = await billing.downloadInvoice("inv_123");
window.open(pdfUrl);
```
