package domain

type Permission struct {
	Module  string   `bson:"module" json:"module"`
	Actions []string `bson:"actions" json:"actions"`
}

type Role struct {
	Name        string       `bson:"name" json:"name"`
	Description string       `bson:"description" json:"description"`
	Permissions []Permission `bson:"permissions" json:"permissions"`
}

// Roles predefinidas
var (
	RoleAdmin = Role{
		Name:        "admin",
		Description: "Administrador do sistema",
		Permissions: []Permission{
			{Module: "users", Actions: []string{"create", "read", "update", "delete"}},
			{Module: "cases", Actions: []string{"create", "read", "update", "delete"}},
			{Module: "documents", Actions: []string{"create", "read", "update", "delete"}},
			{Module: "reports", Actions: []string{"create", "read", "update", "delete"}},
		},
	}

	RoleLawyer = Role{
		Name:        "lawyer",
		Description: "Advogado",
		Permissions: []Permission{
			{Module: "cases", Actions: []string{"create", "read", "update"}},
			{Module: "documents", Actions: []string{"create", "read", "update"}},
		},
	}

	RoleIntern = Role{
		Name:        "intern",
		Description: "Estagiário",
		Permissions: []Permission{
			{Module: "cases", Actions: []string{"read"}},
			{Module: "documents", Actions: []string{"create", "read"}},
		},
	}

	RoleSecretary = Role{
		Name:        "secretary",
		Description: "Secretária",
		Permissions: []Permission{
			{Module: "cases", Actions: []string{"read"}},
			{Module: "documents", Actions: []string{"read"}},
		},
	}
)
