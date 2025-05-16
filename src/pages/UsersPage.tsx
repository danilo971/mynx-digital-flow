
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Mock users data
const mockUsers = [
  { 
    id: 1, 
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=8B5CF6&color=fff',
    role: 'Administrador',
    active: true,
    permissions: {
      dashboard: true,
      pos: true,
      sales: true,
      products: true,
      reports: true,
      users: true,
    }
  },
  { 
    id: 2, 
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=8B5CF6&color=fff',
    role: 'Gerente',
    active: true,
    permissions: {
      dashboard: true,
      pos: true,
      sales: true,
      products: true,
      reports: true,
      users: false,
    }
  },
  { 
    id: 3, 
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Smith&background=8B5CF6&color=fff',
    role: 'Vendedor',
    active: true,
    permissions: {
      dashboard: true,
      pos: true,
      sales: true,
      products: false,
      reports: false,
      users: false,
    }
  },
  { 
    id: 4, 
    name: 'Michael Brown',
    email: 'michael@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=8B5CF6&color=fff',
    role: 'Estoquista',
    active: false,
    permissions: {
      dashboard: true,
      pos: false,
      sales: false,
      products: true,
      reports: false,
      users: false,
    }
  },
];

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  
  // Filter users by search term
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerenciamento de usuários e permissões
          </p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              Total de {filteredUsers.length} usuários encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou função"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Permissões</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {user.active ? (
                            <Badge className="bg-green-500 hover:bg-green-600">
                              <UserCheck className="mr-1 h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <UserX className="mr-1 h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <div className="group relative">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Dashboard
                              </span>
                            </div>
                            <div className="group relative">
                              {user.permissions.pos ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                PDV
                              </span>
                            </div>
                            <div className="group relative">
                              {user.permissions.sales ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Vendas
                              </span>
                            </div>
                            <div className="group relative">
                              {user.permissions.products ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Produtos
                              </span>
                            </div>
                            <div className="group relative">
                              {user.permissions.reports ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Relatórios
                              </span>
                            </div>
                            <div className="group relative">
                              {user.permissions.users ? (
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted"></div>
                              )}
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-white text-xs px-2 py-1 rounded">
                                Usuários
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <span className="sr-only">Abrir menu</span>
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                >
                                  <path
                                    d="M8.625 2.5C8.625 3.12132 8.12132 3.625 7.5 3.625C6.87868 3.625 6.375 3.12132 6.375 2.5C6.375 1.87868 6.87868 1.375 7.5 1.375C8.12132 1.375 8.625 1.87868 8.625 2.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM7.5 13.625C8.12132 13.625 8.625 13.1213 8.625 12.5C8.625 11.8787 8.12132 11.375 7.5 11.375C6.87868 11.375 6.375 11.8787 6.375 12.5C6.375 13.1213 6.87868 13.625 7.5 13.625Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Opções</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  toast({
                                    title: "Editar usuário",
                                    description: `Editando ${user.name}`,
                                  });
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Badge variant="outline" className="mr-2 h-4 w-4 p-0 flex items-center justify-center">
                                  P
                                </Badge>
                                Permissões
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.active ? (
                                <DropdownMenuItem
                                  onClick={() => {
                                    toast({
                                      title: "Usuário desativado",
                                      description: `${user.name} foi desativado`,
                                    });
                                  }}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Desativar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => {
                                    toast({
                                      title: "Usuário ativado",
                                      description: `${user.name} foi ativado`,
                                    });
                                  }}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Ativar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  toast({
                                    variant: "destructive",
                                    title: "Excluir usuário",
                                    description: `${user.name} foi excluído`,
                                  });
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UsersPage;
