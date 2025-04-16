import qz from 'qz-tray'
import { toast } from 'svelte-sonner'

export class PrintingOrder {
  printer: string = $state('')
  printers: string[] | string = $state([])

  constructor() {
    this.setPrinter('')
  }

  async connect() {
    if (qz.websocket.isActive()) {
      return
    }
    try {
      await qz.websocket.connect()
    } catch (error) {
      console.error('Erro ao conectar na impressora', error)
      toast.error('Erro ao conectar na impressora')
    }
  }

  async listPrinters() {
    try {
      this.printers = await qz.printers.find()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao listar impressoras')
      return
    }

    if (this.printers.length === 0) {
      toast.error('Nenhuma impressora encontrada')
      return
    }

    if (this.printers.length === 1) {
      this.setPrinter(this.printers[0])
    }

    return this.printers
  }

  async print(data: qz.PrintData[] | string[]) {
    if (!this.printer) {
      toast.error('Selecione uma impressora')
      return
    }

    const config = qz.configs.create(this.printer, {
      encoding: 'CP850',
    })

    try {
      await qz.print(config, data)
      toast.success('Impressão enviada com sucesso')
    } catch (error) {
      console.error('Erro ao imprimir', error)
      toast.error('Erro ao imprimir')
    }
  }

  setPrinter(printer: string) {
    this.printer = printer
  }

  getPrinter() {
    return this.printer
  }

  setPrinters(printers: string[] | string) {
    this.printers = printers
  }

  getPrinters() {
    return this.printers
  }

  addPrinter(printer: string) {
    if (this.printers.includes(printer)) {
      return
    }
    if (Array.isArray(this.printers)) {
      this.printers.push(printer)
    } else {
        this.printers = printer
    }
  }
}
