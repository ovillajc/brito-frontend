import type { AuthUserEntity, RoleEntity, PermissionEntity } from '../../domain/entities/auth-user.entity'

/**
 * Mapper para transformar datos de la base de datos a entidades de dominio de Auth.
 */
export class AuthMapper {
  /**
   * Transforma la respuesta de Supabase (perfil con roles y permisos) a AuthUserEntity.
   * 
   * @param profileData - Datos crudos del perfil y sus relaciones.
   * @param email - Email del usuario desde Auth.
   * @returns AuthUserEntity
   */
  static toDomain(profileData: any, email: string): AuthUserEntity {
    const rolesMap = new Map<string, RoleEntity>()
    const permissionsSet = new Set<string>()

    if (profileData.profiles_roles) {
      profileData.profiles_roles.forEach((pr: any) => {
        const role = pr.roles
        if (!role) return

        if (!rolesMap.has(role.id)) {
          rolesMap.set(role.id, {
            id: role.id,
            name: role.name,
            description: role.description,
            permissions: []
          })
        }

        const domainRole = rolesMap.get(role.id)!

        if (role.roles_permissions) {
          role.roles_permissions.forEach((rp: any) => {
            const perm = rp.permissions
            if (!perm) return

            // Evitar duplicados en permisos del rol
            if (!domainRole.permissions.some(p => p.id === perm.id)) {
              domainRole.permissions.push({
                id: perm.id,
                name: perm.name,
                description: perm.description
              })
            }
            permissionsSet.add(perm.name)
          })
        }
      })
    }

    // Agregar permiso especial 'all_access' si algún rol lo tiene
    const permissions = Array.from(permissionsSet)

    return {
      id: profileData.id,
      email: email,
      fullName: profileData.full_name,
      roles: Array.from(rolesMap.values()),
      permissions
    }
  }
}
