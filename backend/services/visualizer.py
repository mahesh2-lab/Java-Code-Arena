import javalang
import json
import uuid

class JavaVisualizer:
    def __init__(self, code):
        self.code = code
        self.tree = None
        self.steps = []
        self.stack = []  # List of stack frames
        self.heap = {}   # ID -> Object
        self.console = []
        self.current_step = 0

    def visualize(self):
        try:
            self.tree = javalang.parse.parse(self.code)
            # Find the main method to start simulation
            main_method = self._find_main_method()
            if not main_method:
                return {"success": False, "error": "Main method not found"}

            # Start simulation
            self._simulate_method(main_method)
            return {"success": True, "steps": self.steps}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def _find_main_method(self):
        for path, node in self.tree.filter(javalang.tree.MethodDeclaration):
            if node.name == "main" and "static" in node.modifiers:
                return node
        return None

    def _simulate_method(self, method_node):
        # Initial stack frame
        frame = {
            "id": str(uuid.uuid4()),
            "name": method_node.name,
            "locals": {}
        }
        self.stack.append(frame)
        
        # Record initial state
        self._record_step("Starting " + method_node.name)

        if method_node.body:
            for statement in method_node.body:
                self._execute_statement(statement)

        self.stack.pop()
        self._record_step("Finished " + method_node.name)

    def _execute_statement(self, stmt):
        if isinstance(stmt, javalang.tree.VariableDeclaration):
            for decl in stmt.declarators:
                value = self._evaluate_expression(decl.initializer)
                self.stack[-1]["locals"][decl.name] = value
                self._record_step(f"Declared {decl.name} = {value}", line=decl.position.line if decl.position else None)
        
        elif isinstance(stmt, javalang.tree.StatementExpression):
            expr = stmt.expression
            if isinstance(expr, javalang.tree.Assignment):
                name = expr.expressionl.member
                value = self._evaluate_expression(expr.value)
                self.stack[-1]["locals"][name] = value
                self._record_step(f"Assigned {name} = {value}", line=expr.position.line if expr.position else None)
            elif isinstance(expr, javalang.tree.MethodInvocation):
                if expr.member == "println" and expr.qualifier == "System.out":
                    args = [str(self._evaluate_expression(a)) for a in expr.arguments]
                    output = " ".join(args)
                    self.console.append(output)
                    self._record_step(f"Printed: {output}", line=expr.position.line if expr.position else None)

    def _evaluate_expression(self, expr):
        if expr is None:
            return None
        
        if isinstance(expr, javalang.tree.Literal):
            val = expr.value
            if val.startswith('"') and val.endswith('"'):
                return val[1:-1]
            try:
                if '.' in val: return float(val)
                return int(val)
            except:
                return val
        
        if isinstance(expr, javalang.tree.MemberReference):
            return self.stack[-1]["locals"].get(expr.member, None)
        
        if isinstance(expr, javalang.tree.BinaryOperation):
            left = self._evaluate_expression(expr.operandl)
            right = self._evaluate_expression(expr.operandr)
            try:
               if expr.operator == "+":
                   if isinstance(left, str) or isinstance(right, str):
                       return str(left) + str(right)
                   return left + right
               if expr.operator == "-": return left - right
               if expr.operator == "*": return left * right
               if expr.operator == "/": return left / right
            except:
               return "Error"
        
        if isinstance(expr, javalang.tree.ClassCreator):
            obj_id = f"obj_{len(self.heap)}"
            self.heap[obj_id] = {
                "type": expr.type.name,
                "fields": { "hash": hex(id(expr)) }
            }
            return obj_id

        if isinstance(expr, javalang.tree.ArrayCreator):
            obj_id = f"arr_{len(self.heap)}"
            size = self._evaluate_expression(expr.dimensions[0]) if expr.dimensions else 0
            self.heap[obj_id] = {
                "type": f"{expr.type.name}[]",
                "fields": { f"[{i}]": 0 for i in range(int(size) if isinstance(size, (int, float)) else 0) }
            }
            return obj_id

        return "..."

    def _record_step(self, description, line=None):
        snapshot = {
            "description": description,
            "line": line,
            "console": "\n".join(self.console),
            "graph": self._generate_graph()
        }
        self.steps.append(snapshot)

    def _generate_graph(self):
        nodes = []
        edges = []
        
        # Stack nodes
        y_offset = 0
        for i, frame in enumerate(reversed(self.stack)):
            frame_id = f"frame_{frame['id']}"
            nodes.append({
                "id": frame_id,
                "type": "stackFrame",
                "data": {"label": frame["name"], "locals": frame["locals"]},
                "position": {"x": 50, "y": y_offset}
            })
            y_offset += 150
            
            # Edges to heap objects if local is a reference (simplified)
            for name, val in frame["locals"].items():
                if isinstance(val, str) and (val.startswith("obj_") or val.startswith("arr_")):
                    edges.append({
                        "id": f"edge_{frame_id}_{val}",
                        "source": frame_id,
                        "target": val,
                        "label": name
                    })

        # Heap nodes (simplified for now)
        hx = 400
        hy = 50
        for obj_id, obj in self.heap.items():
            nodes.append({
                "id": obj_id,
                "type": "heapObject",
                "data": {"type": obj["type"], "fields": obj["fields"]},
                "position": {"x": hx, "y": hy}
            })
            hy += 150

        return {"nodes": nodes, "edges": edges}

def visualize_code(code):
    v = JavaVisualizer(code)
    return v.visualize()
