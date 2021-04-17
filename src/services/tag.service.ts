
import { COLLECTIONS } from '../config/constants';
import { IContextData } from '../interfaces/context-data.interface';
import ResolversOperationsService from './resolvers-operations.service';
import { findOneElement, asignDocumentId } from '../lib/db-operations';
import slugify from 'slugify';

class TagService extends ResolversOperationsService {
    collection = COLLECTIONS.TAGS;
    constructor(root: object, variables: object, context: IContextData) {
      super(root, variables, context);
    }
    async items(){
        const page = this.getVariables().pagination?.page;
        const itemsPage = this.getVariables().pagination?.itemsPage;
        console.log(this.getVariables().pagination);
        console.log(page, itemsPage);
        const result = await this.list(this.collection,'Tags', page,itemsPage);
        return{
            info: result.info,
            status: result.status,
            message: result.message,
            tags: result.item
        };
    }

    async details(){
        const result = await this.get(this.collection);
        return{
            status: result.status,
            message: result.message,
            tag:result.item
        };
    }
    async insert(){
        const tag = this.getVariables().tag;
        // Comprobar que no esta en blanco ni este indefinido
        if (!this.checkData(tag || '')) {
            return {
                status: false,
                message: 'El tag no se ha especificado correctamente',
                tag: null
            };
        }
        // Comprobar que no existe
        if (await this.checkInDatabase(tag || '')) {
            return{
                status: false,
                message: 'El tag existe en la base de datos, intenta con otro tag',
                tag: null
            };
        }
        // Si valida las opciones anteriores, venir aqui y crear el documento
        const tagObject={
            id: await asignDocumentId(this.getDb(),this.collection,{id:-1}),
            name: tag,
            slug: slugify(tag || '', {lower:true})
        };
        const result= await this.add(this.collection,tagObject,'tag');
        return{
            status: result.status,
            message: result.message,
            tag:result.item
        };
    }
    async modify(){
        const id= this.getVariables().id;
        const tag = this.getVariables().tag;
        if (!this.checkData(String(id) || '')) {
            return {
                status: false,
                message: `El id del tag no se ha especificado correctamente`,
                tag: null
            };
        }
        if (!this.checkData(tag || '')) {
            return {
                status: false,
                message: `El tag no se ha especificado correctamente`,
                tag: null
            };
        }
        const objectUpdate = {
            name: tag,
            slug: slugify(tag || '',{lower:true})
        };
        const result = await this.update(this.collection,{id},objectUpdate,'tag');
        return{
            status: result.status,
            message: result.message,
            tag:result.item
        };
    }
    async delete(){
        const id = this.getVariables().id;
        if (!this.checkData(String(id) || '')) {
            return {
                status: false,
                message: `El id del tag no se ha especificado correctamente`,
                tag: null
            };
        }
        const result = await this.del(this.collection,{id},'tag');
        return{
            status: result.status,
            message: result.message
        };
    }
    async block(){
        const id = this.getVariables().id;
        if (!this.checkData(String(id) || '')) {
            return {
                status: false,
                message: `El id del tag no se ha especificado correctamente`,
                tag: null
            };
        }
        const result = await this.update(this.collection,{id},{active:false},'tag');
        return {
            status: result.status,
            message: result.status
              ? 'Boqueado Correctamente'
              : 'No se ha bloqueado comprobado por favor',
          };
    }
    private checkData(value: string){
        return (value==='' || value===undefined) ? false : true;
    }
    private async checkInDatabase(value:string){
        return await findOneElement(this.getDb(),this.collection,{name:value});
    }
    
}

export default TagService;