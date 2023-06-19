import { EditUserDto } from "src/modules/users/dto/users-edit.dto";
import { User } from "src/modules/users/entity/users";
import { v4 as uuidv4 } from 'uuid';

export default class UsersServiceMock {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async create(data: any): Promise<User> {
    const newUser = { ...data, id: uuidv4() };
    this.users.push(newUser);
    return newUser;
  }

  async findById(id: string): Promise<User> {
    return this.users.find(user => user.id === id);
  }

  async delete(id: string) {
    const index = this.users.findIndex(user => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  async update(editUserDto: EditUserDto, id: string) {
    const user = this.users.find(user => user.id === id);
    if (user) {
      user.us_nom = editUserDto.us_nom;
      user.us_email = editUserDto.us_email;
    }
    return user;
  }
}
