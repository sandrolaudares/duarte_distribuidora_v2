import { z } from "zod"

export const schemaStep1 = z.object({
  tenantName: z.string().min(1, 'Nome da distribuidora é necessário'),
  subdomain: z.string().min(1, 'Subdomínio é necessário'),
  name: z.string().min(1, 'Nome é necessário'),
  email: z.string().email('Endereço de email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(6, 'A confirmação da senha deve ter pelo menos 6 caracteres'),
})

export const schemaStep2 = schemaStep1
  .extend({
    phone: z.string().min(1, 'Telefone é necessário'),
    cep: z.string(),
    street: z.string().min(1, 'Rua é necessária'),
    neighborhood: z.string().min(1, 'Bairro é necessário'),
    number: z.string().min(1, 'Número é necessário'),
    city: z.string().min(1, 'Cidade é necessária'),
    state: z.string().min(2, 'O estado deve ter pelo menos 2 caracteres'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas devem coincidir',
    path: ['confirmPassword'],
  })
