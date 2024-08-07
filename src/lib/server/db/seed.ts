/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker'
import { hash } from '@node-rs/argon2'
import { generateId } from 'lucia'
import { product, user, distribuidora, customer } from './controller'

const main = async () => {
  await seedUsers()
  await seedCategories()
  await seedProducts()
  await seedDistribuidora()
  await seedCustomers()
}
main()

async function seedUsers() {
  console.log('userTable seed START')

  try {
    await user.insertUser({
      id: generateId(15),
      username: 'administrator',
      email: 'admin@localhost.com',
      password_hash: await hash('123456', {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      }),
    })
  } catch (error) {
    console.error('Failed to insert administrator:', error)
  }

  for (let i = 0; i < 20; i++) {
    try {
      await user.insertUser({
        id: generateId(15),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password_hash: await hash('password', {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        }),
      })
    } catch (error) {
      console.error(`Failed to insert user ${i}:`, error)
    }
  }

  console.log('userTable seed END')
}

async function seedCategories() {
  console.log('categoryTable seed START')

  for (let i = 0; i < 10; i++) {
    try {
      await product.insertProductCategory({
        name: faker.commerce.department(),
      })
    } catch (error) {
      console.error(`Failed to insert category ${i}:`, error)
    }
  }

  console.log('categoryTable seed END')
}

async function seedProducts() {
  console.log('productTable seed START')

  for (let i = 0; i < 20; i++) {
    try {
      await product.insertProduct({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category_id: i,
      })
    } catch (error) {
      console.error(`Failed to insert product ${i}:`, error)
    }
  }

  for (let i = 0; i < 20; i++) {
    try {
      await product.insertProductItem({
        product_id: i,
        name: faker.commerce.productName(),
        retail_price: faker.number.int(),
        wholesale_price: faker.number.int(),
      })
      await product.insertProductItem({
        product_id: i,
        name: faker.commerce.productName(),
        retail_price: faker.number.int(),
        wholesale_price: faker.number.int({ min: 0, max: 30000 }),
      })
    } catch (error) {
      console.error(`Failed to insert product item ${i}:`, error)
    }
  }

  console.log('productTable seed END')
}

async function seedDistribuidora() {
  console.log('distribuidoraTable seed START')

  try {
    const [distrib] = await distribuidora
      .insertDistribuidora({
        name: 'Distribuidora Teste',
      })
      .returning()

    await distribuidora.insertCashier({
      distribuidora_id: distrib.id,
      currency: 0,
      name: 'Caixa Teste',
    })
  } catch (error) {
    console.error('Failed to insert distribuidora:', error)
  }
}

async function seedCustomers() {
  console.log('customerTable seed START')

  for (let i = 0; i < 20; i++) {
    try {
      const [cust] = await customer
        .insertCustomer({
          name: faker.person.firstName(),
          email: faker.internet.email(),
          is_retail: faker.datatype.boolean(),
        })
        .returning()

      await customer.insertAddress({
        cep: faker.location.zipCode(),
        street: faker.location.street(),
        city: faker.location.city(),
        state: faker.location.state(),
        customer_id: cust.id,
        complement: faker.location.secondaryAddress(),
        country: faker.location.country(),
        neighborhood: faker.location.county(),
        number: faker.number.int().toString(),
      })
    } catch (error) {
      console.error(`Failed to insert customer ${i}:`, error)
    }
  }

  console.log('customerTable seed END')
}
