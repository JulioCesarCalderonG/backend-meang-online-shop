import { IContextData } from '../interfaces/context-data.interface';
import { IVariables } from '../interfaces/variables.interface';
import { deleteOne, findElements, findOneElement, insertOneElement, updateOneElement } from '../lib/db-operations';
import { Db } from 'mongodb';
import { pagination } from '../lib/pagination';

class ResolversOperationsService {
    private root: object;
    private variables: IVariables;
    private context: IContextData;
    constructor(root: object, variables: IVariables, context: IContextData) {
        this.root = root;
        this.variables = variables;
        this.context = context;
    }
    protected getContext(): IContextData { return this.context; }
    protected getDb(): Db { return this.context.db!; }
    protected getVariables(): IVariables { return this.variables; }
    // Listar informaciones
    protected async list(collection: string, listElement: string, page: number = 1, itemsPage: number = 20, filter: object = { active: { $ne: false } }) {
        try {
            const paginationData = await pagination(this.getDb(), collection, page, itemsPage, filter);

            return {
                info: {
                    page: paginationData.page,
                    pages: paginationData.pages,
                    itemsPage: paginationData.itemsPage,
                    total: paginationData.total
                },
                status: true,
                message: `Lista de ${listElement} correctamente cargada`,
                item: await findElements(this.getDb(), collection, filter, paginationData)
            };
        } catch (error) {
            return {
                info: null,
                status: false,
                message: `Lista de ${listElement} no cargada: ${error}`,
                item: null
            };
        }
    }
    // Obtener detalles del item
    protected async get(collection: string) {
        const collectionLabel = collection.toLowerCase();
        try {
            return await findOneElement(this.getDb(), collection, { id: this.variables.id }).then(
                result => {
                    if (result) {
                        return {
                            status: true,
                            message: `${collectionLabel} ha sido cargada correctamente con sus detalles`,
                            item: result
                        };
                    }
                    return {
                        status: true,
                        message: `${collectionLabel} no ha obtenido detalles porque no existe`,
                        item: null
                    };
                }
            );
        } catch (error) {
            return {
                status: false,
                message: `Error inesperado al queres cargar los detalles de ${collectionLabel}`,
                item: null
            };
        }
    }
    // Añadir item
    protected async add(collection: string, document: object, item: string) {
        try {
            return await insertOneElement(this.getDb(), collection, document).then(
                res => {
                    if (res.result.ok === 1) {
                        return {
                            status: true,
                            message: `Añadido correctamente el ${item}.`,
                            item: document
                        };
                    }
                    return {
                        status: false,
                        message: `No se ha insertado el ${item}. Intentalo de nuevo por favor`,
                        item: null
                    };
                }
            );
        } catch (error) {
            return {
                status: false,
                message: `Error inesperado al insertar el ${item}. Intentalo de nuevo por favor`,
                item: null
            };
        }
    }
    // Modificar item
    protected async update(collection: string, filter: object, objectUpdate: object, item: string) {
        try {
            return await updateOneElement(
                this.getDb(),
                collection,
                filter,
                objectUpdate
            ).then(
                res => {
                    if (res.result.nModified === 1 && res.result.ok) {
                        return {
                            status: true,
                            message: `Elemento del ${item} actualizado correctamente.`,
                            item: Object.assign({}, filter, objectUpdate)
                        };
                    }
                    return {
                        status: false,
                        message: `Elemento del ${item} no se ha actualizado. Comprueba que estas filtrando correctamente o simplemente no hay nada que actualizar.`,
                        item: null
                    };
                }
            );
        } catch (error) {
            return {
                status: false,
                message: `Error inesperado al actualizar el ${item}. Intentalo de nuevo`,
                item: null
            }
        }
    }
    // Eliminar item
    protected async del(collection: string, filter: object, item: string) {
        try {
            return await deleteOne(this.getDb(), collection, filter).then(
                (res) => {
                    if (res.deletedCount === 1) {
                        return {
                            status: true,
                            message: `Elemento del ${item} borrado correctamente.`
                        };
                    }
                    return {
                        status: false,
                        message: `Elemento del ${item} no se ha borrado comprueba el filtro.`
                    };
                }
            );
        } catch (error) {
            return {
                status: false,
                message: `Error inesperado no se ha podido eliminar el ${item}. Intentalo de nuevo`,
                item: null
            };
        }
    }
}

export default ResolversOperationsService;