import { Faker } from 'k6/x/faker';
const faker = new Faker();
export function randomEmail() {
    const randomEmail = faker.person.email();
    return randomEmail;
};