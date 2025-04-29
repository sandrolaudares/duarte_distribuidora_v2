import type { cashierTransactionEnum } from '$lib/utils/enums'
import { toast } from 'svelte-sonner'

const colorMap: Record<(typeof cashierTransactionEnum)[number], string> = {
  Abertura: 'badge-success text-white',
  Fechamento: 'badge-error text-white',
  Pagamento: 'badge-primary',
  Sangria: 'badge-warning',
  Despesas: 'badge-accent',
  Deposito: 'badge-info',
}

export function getColor(type: (typeof cashierTransactionEnum)[number]) {
  return colorMap[type] || 'badge-neutral'
}

export const cssPrintTable = `
    @page {
      size: A4 portrait;
      margin: 8mm;
    }

    body {
      font-family: 'Segoe UI', sans-serif;
      font-size: 12pt;
      color: #333;
      background: white;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1em;
    }

    thead {
      background-color: #f0f0f0;
    }

    th, td {
      border: 1px solid #ccc;
      padding: 4px 6px;
      text-align: left;
    }

    tbody tr:nth-child(even) {
      background-color: #fafafa;
    }

    tfoot {
      background-color: #f0f0f0;
      font-weight: bold;
    }

    a {
      color: #000;
      text-decoration: none;
    }

    .badge {
      display: inline-block;
      padding: 0.25em 0.5em;
      background-color: #007bff;
      color: #fff;
      border-radius: 0.25rem;
      font-size: 0.75em;
    }

    .text-success {
      color: #28a745;
    }

    .text-error {
      color: #dc3545;
    }

    .text-secondary {
      color: #6c757d;
    }

    .uppercase {
      text-transform: uppercase;
    }

    .font-bold {
      font-weight: bold;
    }

    .whitespace-nowrap {
      white-space: nowrap;
    }

    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .py-3 {
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
    }


    .font-medium {
      font-weight: 500;
    }

    .inline-flex {
      display: inline-flex;
    }

    .items-center {
      align-items: center;
    }

    .rounded-full {
      border-radius: 9999px;
    }

    .px-2\\.5 {
      padding-left: 0.625rem;
      padding-right: 0.625rem;
    }

    .py-0\\.5 {
      padding-top: 0.125rem;
      padding-bottom: 0.125rem;
    }

    .gap-1\\.5 {
      gap: 0.375rem;
    }

    .h-2 {
      height: 0.5rem;
    }

    .w-2 {
      width: 0.5rem;
    }

    .rounded-full {
      border-radius: 9999px;
    }

    .bg-emerald-400 {
      background-color: #34d399;
    }

    .bg-rose-400 {
      background-color: #f87171;
    }

    .badge-primary {
      background-color: #007bff;
      color: #fff;
    }

    thead {
      display: table-header-group;
    }

    tfoot {
      display: table-footer-group;
    }

    .table-xs :not(thead):not(tfoot) tr {
      font-size: 0.70rem /* 12px */;
      line-height: 1rem /* 16px */;
  }
  .table-xs :where(th, td) {
      padding-left: 0.4rem /* 8px */;
      padding-right: 0.4rem /* 8px */;
      padding-top: 0.25rem /* 4px */;
      padding-bottom: 0.25rem /* 4px */;
  }

    tr {
      page-break-inside: avoid;
    }
      thead tr:nth-child(2) {
  display: none;
}
  .hddd {
  display: none;}
      @media print {
  th:last-child,
  td:last-child {
    display: none;
  }
}
  `

  export function printTable(tableRef: HTMLTableElement | undefined) {
    if (!tableRef) {
      toast.error('Tabela não encontrada')
      return
    }

    const printWindow = window.open('', '', 'width=1000,height=600')
    if (!printWindow) {
      toast.error('Erro ao abrir a janela de impressão')
      return
    }

    const tableHTML = tableRef.outerHTML

    printWindow.document.title = 'Relatório de Transações'

    const style = printWindow.document.createElement('style')
    style.textContent = cssPrintTable

    printWindow.document.head.appendChild(style)
    printWindow.document.body.innerHTML = tableHTML

    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }