
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";

// Define the UserProfile type
interface UserProfile {
  id: string;
  email: string;
  role: string;
  permissions: {
    manageUsers?: boolean;
    manageProducts?: boolean;
    manageSales?: boolean;
    viewReports?: boolean;
  };
}

// Define the schema for user form
const userFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  role: z.string().min(1, { message: "Role is required" }),
  permissions: z.object({
    manageUsers: z.boolean().optional(),
    manageProducts: z.boolean().optional(),
    manageSales: z.boolean().optional(),
    viewReports: z.boolean().optional()
  })
});

const UsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      role: "user",
      permissions: {
        manageUsers: false,
        manageProducts: false,
        manageSales: false,
        viewReports: false
      }
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    }
  };

  const handleOpenDialog = (user?: UserProfile) => {
    if (user) {
      form.reset({
        email: user.email,
        role: user.role,
        permissions: user.permissions || {
          manageUsers: false,
          manageProducts: false,
          manageSales: false,
          viewReports: false
        }
      });
      setSelectedUserId(user.id);
      setIsEditMode(true);
    } else {
      form.reset({
        email: "",
        role: "user",
        permissions: {
          manageUsers: false,
          manageProducts: false,
          manageSales: false,
          viewReports: false
        }
      });
      setSelectedUserId(null);
      setIsEditMode(false);
    }
    setIsOpen(true);
  };

  const handleSubmit = async (values: z.infer<typeof userFormSchema>) => {
    try {
      if (isEditMode && selectedUserId) {
        // Update existing user
        const { error } = await supabase
          .from("profiles")
          .update({
            email: values.email,
            role: values.role,
            permissions: values.permissions
          })
          .eq("id", selectedUserId);

        if (error) throw error;
        toast.success("User updated successfully");
      } else {
        // Create new user
        const { data, error } = await supabase
          .from("profiles")
          .insert([{
            email: values.email,
            role: values.role,
            permissions: values.permissions
          }]);

        if (error) throw error;
        toast.success("User created successfully");
      }
      
      setIsOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button onClick={() => handleOpenDialog()}>Add New User</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.permissions && (
                    <div className="flex gap-2 flex-wrap">
                      {user.permissions.manageUsers && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Manage Users
                        </span>
                      )}
                      {user.permissions.manageProducts && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Manage Products
                        </span>
                      )}
                      {user.permissions.manageSales && (
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Manage Sales
                        </span>
                      )}
                      {user.permissions.viewReports && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          View Reports
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDialog(user)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Permissions</h3>
                
                <FormField
                  control={form.control}
                  name="permissions.manageUsers"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Manage Users
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="permissions.manageProducts"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Manage Products
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="permissions.manageSales"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Manage Sales
                      </FormLabel>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="permissions.viewReports"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox 
                          checked={field.value} 
                          onCheckedChange={field.onChange} 
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        View Reports
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  {isEditMode ? "Save Changes" : "Add User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
