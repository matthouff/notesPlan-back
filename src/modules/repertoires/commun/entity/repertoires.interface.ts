import { IEntityStarter } from "src/modules/entity-starter.class";

interface IFixedPart { }

interface IMandatoryPart {
  libelle: string;
  id_user: string;
}

interface IOptionalPart { }

export interface IRepertoire
  extends IEntityStarter,
  Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  IOptionalPart { }

export interface IRepertoireCreator extends Readonly<IFixedPart>, Required<IMandatoryPart>, IOptionalPart { }

export interface IRepertoireConstructor
  extends Readonly<IFixedPart>,
  Required<IMandatoryPart>,
  Partial<IOptionalPart> { }

export interface IRepertoireResponse extends IRepertoire { }

export interface IRepertoireEditorMandatory extends Partial<IMandatoryPart> { }
export interface IRepertoireEditorOptional extends IOptionalPart { }
export interface IRepertoireEditor extends IRepertoireEditorMandatory, IRepertoireEditorOptional { }



// export interface IRepertoire {
//   id: number;
//   nom: string | null;
//   prenom: string | null;
//   email: string | null;
//   login: string | null;
//   password: string | null;
// }