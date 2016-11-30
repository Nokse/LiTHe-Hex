
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		var name = v.func ? v.func.name : v.name;
		return '<function' + (name === '' ? '' : ':') + name + '>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;
	
	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}	
	
	return _elm_lang$core$Native_List.fromArray(is);
}

function toInt(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
		start = 1;
	}
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
	}
	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function toFloat(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
		}
		start = 1;
	}
	var dotCount = 0;
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if ('0' <= c && c <= '9')
		{
			continue;
		}
		if (c === '.')
		{
			dotCount += 1;
			if (dotCount <= 1)
			{
				continue;
			}
		}
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	return _elm_lang$core$Result$Ok(parseFloat(s));
}

function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		var value = result._0;
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		currentSend(incomingValue);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _MichaelCombs28$elm_dom$DOM$className = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'className',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _MichaelCombs28$elm_dom$DOM$scrollTop = A2(_elm_lang$core$Json_Decode$field, 'scrollTop', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$scrollLeft = A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$offsetTop = A2(_elm_lang$core$Json_Decode$field, 'offsetTop', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$offsetLeft = A2(_elm_lang$core$Json_Decode$field, 'offsetLeft', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$offsetHeight = A2(_elm_lang$core$Json_Decode$field, 'offsetHeight', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$offsetWidth = A2(_elm_lang$core$Json_Decode$field, 'offsetWidth', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$childNodes = function (decoder) {
	var loop = F2(
		function (idx, xs) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p0) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Json_Decode$succeed(xs),
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return A2(
									loop,
									idx + 1,
									{ctor: '::', _0: x, _1: xs});
							},
							_p0));
				},
				_elm_lang$core$Json_Decode$maybe(
					A2(
						_elm_lang$core$Json_Decode$field,
						_elm_lang$core$Basics$toString(idx),
						decoder)));
		});
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$List$reverse,
		A2(
			_elm_lang$core$Json_Decode$field,
			'childNodes',
			A2(
				loop,
				0,
				{ctor: '[]'})));
};
var _MichaelCombs28$elm_dom$DOM$childNode = function (idx) {
	return _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'childNodes',
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(idx),
				_1: {ctor: '[]'}
			}
		});
};
var _MichaelCombs28$elm_dom$DOM$parentElement = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'parentElement', decoder);
};
var _MichaelCombs28$elm_dom$DOM$previousSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'previousSibling', decoder);
};
var _MichaelCombs28$elm_dom$DOM$nextSibling = _elm_lang$core$Json_Decode$field('nextSibling');
var _MichaelCombs28$elm_dom$DOM$offsetParent = F2(
	function (x, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$field,
					'offsetParent',
					_elm_lang$core$Json_Decode$null(x)),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Json_Decode$field, 'offsetParent', decoder),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_dom$DOM$position = F2(
	function (x, y) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p1) {
				var _p2 = _p1;
				var _p4 = _p2._1;
				var _p3 = _p2._0;
				return A2(
					_MichaelCombs28$elm_dom$DOM$offsetParent,
					{ctor: '_Tuple2', _0: _p3, _1: _p4},
					A2(_MichaelCombs28$elm_dom$DOM$position, _p3, _p4));
			},
			A5(
				_elm_lang$core$Json_Decode$map4,
				F4(
					function (scrollLeft, scrollTop, offsetLeft, offsetTop) {
						return {ctor: '_Tuple2', _0: (x + offsetLeft) - scrollLeft, _1: (y + offsetTop) - scrollTop};
					}),
				_MichaelCombs28$elm_dom$DOM$scrollLeft,
				_MichaelCombs28$elm_dom$DOM$scrollTop,
				_MichaelCombs28$elm_dom$DOM$offsetLeft,
				_MichaelCombs28$elm_dom$DOM$offsetTop));
	});
var _MichaelCombs28$elm_dom$DOM$boundingClientRect = A4(
	_elm_lang$core$Json_Decode$map3,
	F3(
		function (_p5, width, height) {
			var _p6 = _p5;
			return {top: _p6._1, left: _p6._0, width: width, height: height};
		}),
	A2(_MichaelCombs28$elm_dom$DOM$position, 0, 0),
	_MichaelCombs28$elm_dom$DOM$offsetWidth,
	_MichaelCombs28$elm_dom$DOM$offsetHeight);
var _MichaelCombs28$elm_dom$DOM$target = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'target', decoder);
};
var _MichaelCombs28$elm_dom$DOM$Rectangle = F4(
	function (a, b, c, d) {
		return {top: a, left: b, width: c, height: d};
	});

var _MichaelCombs28$elm_parts$Parts$map2nd = F2(
	function (f, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: f(_p1._1)
		};
	});
var _MichaelCombs28$elm_parts$Parts$map1st = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: f(_p3._0),
			_1: _p3._1
		};
	});
var _MichaelCombs28$elm_parts$Parts$generalize = F4(
	function (upd, f, m, c) {
		return A2(
			_MichaelCombs28$elm_parts$Parts$map2nd,
			_elm_lang$core$Platform_Cmd$map(f),
			A2(
				_MichaelCombs28$elm_parts$Parts$map1st,
				_elm_lang$core$Maybe$Just,
				A2(upd, m, c)));
	});
var _MichaelCombs28$elm_parts$Parts$update_ = F2(
	function (_p4, c) {
		var _p5 = _p4;
		return _p5._0(c);
	});
var _MichaelCombs28$elm_parts$Parts$update = F2(
	function (_p6, c) {
		var _p7 = _p6;
		return A2(
			_MichaelCombs28$elm_parts$Parts$map1st,
			_elm_lang$core$Maybe$withDefault(c),
			_p7._0(c));
	});
var _MichaelCombs28$elm_parts$Parts$indexed = F3(
	function (get, set, model0) {
		return {
			ctor: '_Tuple2',
			_0: F2(
				function (idx, c) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						model0,
						A2(
							_elm_lang$core$Dict$get,
							idx,
							get(c)));
				}),
			_1: F3(
				function (idx, model, c) {
					return A2(
						set,
						A3(
							_elm_lang$core$Dict$insert,
							idx,
							model,
							get(c)),
						c);
				})
		};
	});
var _MichaelCombs28$elm_parts$Parts$accessors = F4(
	function (get0, set0, model0, idx) {
		var _p8 = A3(_MichaelCombs28$elm_parts$Parts$indexed, get0, set0, model0);
		var get = _p8._0;
		var set = _p8._1;
		return {
			get: get(idx),
			set: set(idx),
			map: F2(
				function (f, c) {
					return A3(
						_elm_lang$core$Basics$flip,
						set(idx),
						c,
						f(
							A2(get, idx, c)));
				}),
			reset: function (c) {
				return function (m) {
					return A2(set0, m, c);
				}(
					A2(
						_elm_lang$core$Dict$remove,
						idx,
						get0(c)));
			}
		};
	});
var _MichaelCombs28$elm_parts$Parts$embedUpdate = F6(
	function (get, set, update, f, msg, c) {
		return A2(
			_MichaelCombs28$elm_parts$Parts$map1st,
			_elm_lang$core$Maybe$map(
				A2(_elm_lang$core$Basics$flip, set, c)),
			A3(
				update,
				f,
				msg,
				get(c)));
	});
var _MichaelCombs28$elm_parts$Parts$embedView = F2(
	function (get, view) {
		return function (_p9) {
			return view(
				get(_p9));
		};
	});
var _MichaelCombs28$elm_parts$Parts$Accessors = F4(
	function (a, b, c, d) {
		return {get: a, set: b, map: c, reset: d};
	});
var _MichaelCombs28$elm_parts$Parts$Msg = function (a) {
	return {ctor: 'Msg', _0: a};
};
var _MichaelCombs28$elm_parts$Parts$partial = F3(
	function (fwd, upd, msg) {
		return _MichaelCombs28$elm_parts$Parts$Msg(
			function (c) {
				return A3(
					upd,
					function (_p10) {
						return fwd(
							A3(_MichaelCombs28$elm_parts$Parts$partial, fwd, upd, _p10));
					},
					msg,
					c);
			});
	});
var _MichaelCombs28$elm_parts$Parts$pack = F5(
	function (update, get0, set0, model0, fwd) {
		var _p11 = A3(_MichaelCombs28$elm_parts$Parts$indexed, get0, set0, model0);
		var get = _p11._0;
		var set = _p11._1;
		return function (idx) {
			return function (_p12) {
				return fwd(
					A3(
						_MichaelCombs28$elm_parts$Parts$partial,
						fwd,
						A3(
							_MichaelCombs28$elm_parts$Parts$embedUpdate,
							get(idx),
							set(idx),
							update),
						_p12));
			};
		};
	});
var _MichaelCombs28$elm_parts$Parts$create = F6(
	function (view, update, get0, set0, model0, fwd) {
		var embeddedUpdate = A5(_MichaelCombs28$elm_parts$Parts$pack, update, get0, set0, model0, fwd);
		var get = _elm_lang$core$Tuple$first(
			A3(_MichaelCombs28$elm_parts$Parts$indexed, get0, set0, model0));
		return F2(
			function (idx, c) {
				return A2(
					view,
					embeddedUpdate(idx),
					A2(get, idx, c));
			});
	});
var _MichaelCombs28$elm_parts$Parts$pack1 = F4(
	function (update, get, set, fwd) {
		return function (_p13) {
			return fwd(
				A3(
					_MichaelCombs28$elm_parts$Parts$partial,
					fwd,
					A3(_MichaelCombs28$elm_parts$Parts$embedUpdate, get, set, update),
					_p13));
		};
	});
var _MichaelCombs28$elm_parts$Parts$create1 = F5(
	function (view, update, get, set, fwd) {
		var embeddedUpdate = function (_p14) {
			return fwd(
				A3(
					_MichaelCombs28$elm_parts$Parts$partial,
					fwd,
					A3(_MichaelCombs28$elm_parts$Parts$embedUpdate, get, set, update),
					_p14));
		};
		return A2(
			_MichaelCombs28$elm_parts$Parts$embedView,
			get,
			view(embeddedUpdate));
	});

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (!a.options === b.options)
	{
		if (a.stopPropagation !== b.stopPropagation || a.preventDefault !== b.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { callback(); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _MichaelCombs28$elm_mdl$Material_Helpers$partsUpdatePort = function (component) {
	var _p0 = component;
	if (_p0.ctor === 'Just') {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Maybe$Just(_p0._0._0),
			_1: _p0._0._1
		};
	} else {
		return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
	}
};
var _MichaelCombs28$elm_mdl$Material_Helpers$noAttr = A2(_elm_lang$html$Html_Attributes$attribute, 'data-elm-mdl-noop', '');
var _MichaelCombs28$elm_mdl$Material_Helpers$aria = F2(
	function (name, value) {
		return value ? A2(
			_elm_lang$html$Html_Attributes$attribute,
			A2(_elm_lang$core$Basics_ops['++'], 'aria-', name),
			'true') : _MichaelCombs28$elm_mdl$Material_Helpers$noAttr;
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$delay = F2(
	function (t, x) {
		return A2(
			_elm_lang$core$Task$perform,
			_elm_lang$core$Basics$always(x),
			_elm_lang$core$Process$sleep(t));
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$cssTransitionStep = function (x) {
	return A2(_MichaelCombs28$elm_mdl$Material_Helpers$delay, 50, x);
};
var _MichaelCombs28$elm_mdl$Material_Helpers$cmd = function (msg) {
	return A2(
		_elm_lang$core$Task$perform,
		_elm_lang$core$Basics$always(msg),
		_elm_lang$core$Task$succeed(msg));
};
var _MichaelCombs28$elm_mdl$Material_Helpers$lift = F6(
	function (get, set, fwd, update, action, model) {
		var _p1 = A2(
			update,
			action,
			get(model));
		var submodel_ = _p1._0;
		var e = _p1._1;
		return {
			ctor: '_Tuple2',
			_0: A2(set, model, submodel_),
			_1: A2(_elm_lang$core$Platform_Cmd$map, fwd, e)
		};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$lift_ = F5(
	function (get, set, update, action, model) {
		return {
			ctor: '_Tuple2',
			_0: A2(
				set,
				model,
				A2(
					update,
					action,
					get(model))),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$map2nd = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: _p3._0,
			_1: f(_p3._1)
		};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$map1st = F2(
	function (f, _p4) {
		var _p5 = _p4;
		return {
			ctor: '_Tuple2',
			_0: f(_p5._0),
			_1: _p5._1
		};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$blurOn = function (evt) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		A2(_elm_lang$core$Basics_ops['++'], 'on', evt),
		'this.blur()');
};
var _MichaelCombs28$elm_mdl$Material_Helpers$effect = F2(
	function (e, x) {
		return {ctor: '_Tuple2', _0: x, _1: e};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$pure = _MichaelCombs28$elm_mdl$Material_Helpers$effect(_elm_lang$core$Platform_Cmd$none);
var _MichaelCombs28$elm_mdl$Material_Helpers$filter = F3(
	function (elem, attr, html) {
		return A2(
			elem,
			attr,
			A2(
				_elm_lang$core$List$filterMap,
				function (x) {
					return x;
				},
				html));
	});

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _MichaelCombs28$elm_mdl$Material_Options_Internal$None = {ctor: 'None'};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Set = function (a) {
	return {ctor: 'Set', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Many = function (a) {
	return {ctor: 'Many', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Internal = function (a) {
	return {ctor: 'Internal', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute = _MichaelCombs28$elm_mdl$Material_Options_Internal$Internal;
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute = function (a) {
	return {ctor: 'Attribute', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$CSS = function (a) {
	return {ctor: 'CSS', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Class = function (a) {
	return {ctor: 'Class', _0: a};
};

var _MichaelCombs28$elm_mdl$Material_Options$id = function (_p0) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute(
		_elm_lang$html$Html_Attributes$id(_p0));
};
var _MichaelCombs28$elm_mdl$Material_Options$attr = _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute;
var _MichaelCombs28$elm_mdl$Material_Options$attribute = _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute;
var _MichaelCombs28$elm_mdl$Material_Options$stylesheet = function (css) {
	return A3(
		_elm_lang$html$Html$node,
		'style',
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(css),
			_1: {ctor: '[]'}
		});
};
var _MichaelCombs28$elm_mdl$Material_Options$data = F2(
	function (key, val) {
		return _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute(
			A2(
				_elm_lang$html$Html_Attributes$attribute,
				A2(_elm_lang$core$Basics_ops['++'], 'data-', key),
				val));
	});
var _MichaelCombs28$elm_mdl$Material_Options$set = _MichaelCombs28$elm_mdl$Material_Options_Internal$Set;
var _MichaelCombs28$elm_mdl$Material_Options$inner = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{
					inner: A2(_elm_lang$core$Basics_ops['++'], options, c.inner)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Options$nop = _MichaelCombs28$elm_mdl$Material_Options_Internal$None;
var _MichaelCombs28$elm_mdl$Material_Options$when = F2(
	function (prop, guard) {
		return guard ? prop : _MichaelCombs28$elm_mdl$Material_Options$nop;
	});
var _MichaelCombs28$elm_mdl$Material_Options$maybe = function (prop) {
	return A2(_elm_lang$core$Maybe$withDefault, _MichaelCombs28$elm_mdl$Material_Options$nop, prop);
};
var _MichaelCombs28$elm_mdl$Material_Options$many = _MichaelCombs28$elm_mdl$Material_Options_Internal$Many;
var _MichaelCombs28$elm_mdl$Material_Options$css = F2(
	function (key, value) {
		return _MichaelCombs28$elm_mdl$Material_Options_Internal$CSS(
			{ctor: '_Tuple2', _0: key, _1: value});
	});
var _MichaelCombs28$elm_mdl$Material_Options$center = _MichaelCombs28$elm_mdl$Material_Options$many(
	{
		ctor: '::',
		_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'display', 'flex'),
		_1: {
			ctor: '::',
			_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'align-items', 'center'),
			_1: {
				ctor: '::',
				_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'justify-content', 'center'),
				_1: {ctor: '[]'}
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Options$scrim = function (opacity) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Options$css,
		'background',
		A2(
			_elm_lang$core$Basics_ops['++'],
			'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(opacity),
				'))')));
};
var _MichaelCombs28$elm_mdl$Material_Options$cs = function (c) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$Class(c);
};
var _MichaelCombs28$elm_mdl$Material_Options$disabled = function (v) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute(
		_elm_lang$html$Html_Attributes$disabled(v));
};
var _MichaelCombs28$elm_mdl$Material_Options$addAttributes = F2(
	function (summary, attrs) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			summary.attrs,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(summary.css),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$String$join, ' ', summary.classes)),
						_1: {ctor: '[]'}
					}
				},
				attrs));
	});
var _MichaelCombs28$elm_mdl$Material_Options$collect1_ = F2(
	function (options, acc) {
		var _p1 = options;
		switch (_p1.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p1._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p1._0, _1: acc.css}
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p1._0, _1: acc.attrs}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: A2(
							_elm_lang$core$Basics_ops['++'],
							acc.attrs,
							{
								ctor: '::',
								_0: _p1._0,
								_1: {ctor: '[]'}
							})
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _MichaelCombs28$elm_mdl$Material_Options$collect1_, acc, _p1._0);
			case 'Set':
				return acc;
			default:
				return acc;
		}
	});
var _MichaelCombs28$elm_mdl$Material_Options$collect1 = F2(
	function (option, acc) {
		var _p2 = option;
		switch (_p2.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p2._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p2._0, _1: acc.css}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: A2(
							_elm_lang$core$Basics_ops['++'],
							acc.attrs,
							{
								ctor: '::',
								_0: _p2._0,
								_1: {ctor: '[]'}
							})
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p2._0, _1: acc.attrs}
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _MichaelCombs28$elm_mdl$Material_Options$collect1, acc, _p2._0);
			case 'Set':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						config: _p2._0(acc.config)
					});
			default:
				return acc;
		}
	});
var _MichaelCombs28$elm_mdl$Material_Options$recollect = _elm_lang$core$List$foldl(_MichaelCombs28$elm_mdl$Material_Options$collect1);
var _MichaelCombs28$elm_mdl$Material_Options$apply = F4(
	function (summary, ctor, options, attrs) {
		return ctor(
			A2(
				_MichaelCombs28$elm_mdl$Material_Options$addAttributes,
				A2(_MichaelCombs28$elm_mdl$Material_Options$recollect, summary, options),
				attrs));
	});
var _MichaelCombs28$elm_mdl$Material_Options$Summary = F4(
	function (a, b, c, d) {
		return {classes: a, css: b, attrs: c, config: d};
	});
var _MichaelCombs28$elm_mdl$Material_Options$collect = function (_p3) {
	return _MichaelCombs28$elm_mdl$Material_Options$recollect(
		A4(
			_MichaelCombs28$elm_mdl$Material_Options$Summary,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			_p3));
};
var _MichaelCombs28$elm_mdl$Material_Options$collect_ = A2(
	_elm_lang$core$List$foldl,
	_MichaelCombs28$elm_mdl$Material_Options$collect1_,
	A4(
		_MichaelCombs28$elm_mdl$Material_Options$Summary,
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '_Tuple0'}));
var _MichaelCombs28$elm_mdl$Material_Options$styled = F2(
	function (ctor, props) {
		return ctor(
			A2(
				_MichaelCombs28$elm_mdl$Material_Options$addAttributes,
				_MichaelCombs28$elm_mdl$Material_Options$collect_(props),
				{ctor: '[]'}));
	});
var _MichaelCombs28$elm_mdl$Material_Options$div = _MichaelCombs28$elm_mdl$Material_Options$styled(_elm_lang$html$Html$div);
var _MichaelCombs28$elm_mdl$Material_Options$span = _MichaelCombs28$elm_mdl$Material_Options$styled(_elm_lang$html$Html$span);
var _MichaelCombs28$elm_mdl$Material_Options$styled_ = F3(
	function (ctor, props, attrs) {
		return ctor(
			A2(
				_MichaelCombs28$elm_mdl$Material_Options$addAttributes,
				_MichaelCombs28$elm_mdl$Material_Options$collect_(props),
				attrs));
	});
var _MichaelCombs28$elm_mdl$Material_Options$img = F2(
	function (options, attrs) {
		return A4(
			_MichaelCombs28$elm_mdl$Material_Options$styled_,
			_elm_lang$html$Html$img,
			options,
			attrs,
			{ctor: '[]'});
	});

var _MichaelCombs28$elm_mdl$Material_Ripple$styles = F2(
	function (m, frame) {
		var r = m.rect;
		var toPx = function (k) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(
					_elm_lang$core$Basics$round(k)),
				'px');
		};
		var offset = A2(
			_elm_lang$core$Basics_ops['++'],
			'translate(',
			A2(
				_elm_lang$core$Basics_ops['++'],
				toPx(m.x),
				A2(
					_elm_lang$core$Basics_ops['++'],
					', ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						toPx(m.y),
						')'))));
		var rippleSize = toPx(
			(_elm_lang$core$Basics$sqrt((r.width * r.width) + (r.height * r.height)) * 2.0) + 2.0);
		var scale = _elm_lang$core$Native_Utils.eq(frame, 0) ? 'scale(0.0001, 0.0001)' : '';
		var transformString = A2(
			_elm_lang$core$Basics_ops['++'],
			'translate(-50%, -50%) ',
			A2(_elm_lang$core$Basics_ops['++'], offset, scale));
		return {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'width', _1: rippleSize},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'height', _1: rippleSize},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: '-webkit-transform', _1: transformString},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: '-ms-transform', _1: transformString},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'transform', _1: transformString},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		};
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$Metrics = F3(
	function (a, b, c) {
		return {rect: a, x: b, y: c};
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$computeMetrics = function (g) {
	var rect = g.rect;
	var set = F2(
		function (x, y) {
			return _elm_lang$core$Maybe$Just(
				{ctor: '_Tuple2', _0: x - rect.left, _1: y - rect.top});
		});
	return A2(
		_elm_lang$core$Maybe$map,
		function (_p0) {
			var _p1 = _p0;
			return A3(_MichaelCombs28$elm_mdl$Material_Ripple$Metrics, rect, _p1._0, _p1._1);
		},
		function () {
			var _p2 = {ctor: '_Tuple4', _0: g.clientX, _1: g.clientY, _2: g.touchX, _3: g.touchY};
			_v1_3:
			do {
				if (_p2.ctor === '_Tuple4') {
					if ((_p2._0.ctor === 'Just') && (_p2._1.ctor === 'Just')) {
						if ((_p2._0._0 === 0.0) && (_p2._1._0 === 0.0)) {
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: rect.width / 2.0, _1: rect.height / 2.0});
						} else {
							return A2(set, _p2._0._0, _p2._1._0);
						}
					} else {
						if ((_p2._2.ctor === 'Just') && (_p2._3.ctor === 'Just')) {
							return A2(set, _p2._2._0, _p2._3._0);
						} else {
							break _v1_3;
						}
					}
				} else {
					break _v1_3;
				}
			} while(false);
			return _elm_lang$core$Maybe$Nothing;
		}());
};
var _MichaelCombs28$elm_mdl$Material_Ripple$Model = F3(
	function (a, b, c) {
		return {animation: a, metrics: b, ignoringMouseDown: c};
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$DOMState = F6(
	function (a, b, c, d, e, f) {
		return {rect: a, clientX: b, clientY: c, touchX: d, touchY: e, type_: f};
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$geometryDecoder = A7(
	_elm_lang$core$Json_Decode$map6,
	_MichaelCombs28$elm_mdl$Material_Ripple$DOMState,
	A2(_elm_lang$core$Json_Decode$field, 'currentTarget', _MichaelCombs28$elm_dom$DOM$boundingClientRect),
	_elm_lang$core$Json_Decode$maybe(
		A2(_elm_lang$core$Json_Decode$field, 'clientX', _elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(_elm_lang$core$Json_Decode$field, 'clientY', _elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'touches',
				_1: {
					ctor: '::',
					_0: '0',
					_1: {
						ctor: '::',
						_0: 'clientX',
						_1: {ctor: '[]'}
					}
				}
			},
			_elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'touches',
				_1: {
					ctor: '::',
					_0: '0',
					_1: {
						ctor: '::',
						_0: 'clientY',
						_1: {ctor: '[]'}
					}
				}
			},
			_elm_lang$core$Json_Decode$float)),
	A2(_elm_lang$core$Json_Decode$field, 'type', _elm_lang$core$Json_Decode$string));
var _MichaelCombs28$elm_mdl$Material_Ripple$Inert = {ctor: 'Inert'};
var _MichaelCombs28$elm_mdl$Material_Ripple$model = {animation: _MichaelCombs28$elm_mdl$Material_Ripple$Inert, metrics: _elm_lang$core$Maybe$Nothing, ignoringMouseDown: false};
var _MichaelCombs28$elm_mdl$Material_Ripple$Frame = function (a) {
	return {ctor: 'Frame', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Ripple$view_ = F2(
	function (attrs, model) {
		var styling = function () {
			var _p3 = {ctor: '_Tuple2', _0: model.metrics, _1: model.animation};
			if ((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) {
				if (_p3._1.ctor === 'Frame') {
					return A2(_MichaelCombs28$elm_mdl$Material_Ripple$styles, _p3._0._0, _p3._1._0);
				} else {
					return A2(_MichaelCombs28$elm_mdl$Material_Ripple$styles, _p3._0._0, 1);
				}
			} else {
				return {ctor: '[]'};
			}
		}();
		return A2(
			_elm_lang$html$Html$span,
			attrs,
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$span,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'mdl-ripple', _1: true},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'is-animating',
										_1: !_elm_lang$core$Native_Utils.eq(
											model.animation,
											_MichaelCombs28$elm_mdl$Material_Ripple$Frame(0))
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'is-visible',
											_1: !_elm_lang$core$Native_Utils.eq(model.animation, _MichaelCombs28$elm_mdl$Material_Ripple$Inert)
										},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(styling),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$Tick = {ctor: 'Tick'};
var _MichaelCombs28$elm_mdl$Material_Ripple$update = F2(
	function (action, model) {
		var _p4 = action;
		switch (_p4.ctor) {
			case 'Down':
				var _p5 = _p4._0;
				return (_elm_lang$core$Native_Utils.eq(_p5.type_, 'mousedown') && model.ignoringMouseDown) ? _MichaelCombs28$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{ignoringMouseDown: false})) : A2(
					_MichaelCombs28$elm_mdl$Material_Helpers$effect,
					_MichaelCombs28$elm_mdl$Material_Helpers$cssTransitionStep(_MichaelCombs28$elm_mdl$Material_Ripple$Tick),
					_elm_lang$core$Native_Utils.update(
						model,
						{
							animation: _MichaelCombs28$elm_mdl$Material_Ripple$Frame(0),
							metrics: _MichaelCombs28$elm_mdl$Material_Ripple$computeMetrics(_p5),
							ignoringMouseDown: _elm_lang$core$Native_Utils.eq(_p5.type_, 'touchstart') ? true : model.ignoringMouseDown
						}));
			case 'Up':
				return _MichaelCombs28$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{animation: _MichaelCombs28$elm_mdl$Material_Ripple$Inert}));
			default:
				return _elm_lang$core$Native_Utils.eq(
					model.animation,
					_MichaelCombs28$elm_mdl$Material_Ripple$Frame(0)) ? _MichaelCombs28$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{
							animation: _MichaelCombs28$elm_mdl$Material_Ripple$Frame(1)
						})) : _MichaelCombs28$elm_mdl$Material_Helpers$pure(model);
		}
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$Up = {ctor: 'Up'};
var _MichaelCombs28$elm_mdl$Material_Ripple$upOn_ = F2(
	function (f, name) {
		return A2(
			_elm_lang$html$Html_Events$on,
			name,
			_elm_lang$core$Json_Decode$succeed(
				f(_MichaelCombs28$elm_mdl$Material_Ripple$Up)));
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$upOn = _MichaelCombs28$elm_mdl$Material_Ripple$upOn_(_elm_lang$core$Basics$identity);
var _MichaelCombs28$elm_mdl$Material_Ripple$Down = function (a) {
	return {ctor: 'Down', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Ripple$downOn_ = F2(
	function (f, name) {
		return A2(
			_elm_lang$html$Html_Events$on,
			name,
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p6) {
					return f(
						_MichaelCombs28$elm_mdl$Material_Ripple$Down(_p6));
				},
				_MichaelCombs28$elm_mdl$Material_Ripple$geometryDecoder));
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$downOn = _MichaelCombs28$elm_mdl$Material_Ripple$downOn_(_elm_lang$core$Basics$identity);
var _MichaelCombs28$elm_mdl$Material_Ripple$view = function (_p7) {
	return _MichaelCombs28$elm_mdl$Material_Ripple$view_(
		A3(
			_elm_lang$core$Basics$flip,
			_elm_lang$core$List$append,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('mouseup'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('mouseleave'),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('touchend'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('blur'),
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Ripple$downOn('mousedown'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Ripple$downOn('touchstart'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			},
			_p7));
};

var _MichaelCombs28$elm_mdl$Material_Button$icon = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--icon');
var _MichaelCombs28$elm_mdl$Material_Button$minifab = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--mini-fab');
var _MichaelCombs28$elm_mdl$Material_Button$fab = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--fab');
var _MichaelCombs28$elm_mdl$Material_Button$raised = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--raised');
var _MichaelCombs28$elm_mdl$Material_Button$flat = _MichaelCombs28$elm_mdl$Material_Options$nop;
var _MichaelCombs28$elm_mdl$Material_Button$blurAndForward = function (event) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		A2(_elm_lang$core$Basics_ops['++'], 'on', event),
		'this.blur(); (function(self) { var e = document.createEvent(\'Event\'); e.initEvent(\'touchcancel\', true, true); self.lastChild.dispatchEvent(e); }(this));');
};
var _MichaelCombs28$elm_mdl$Material_Button$type_ = function (tp) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					type_: _elm_lang$core$Maybe$Just(tp)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Button$accent = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--accent');
var _MichaelCombs28$elm_mdl$Material_Button$primary = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--primary');
var _MichaelCombs28$elm_mdl$Material_Button$colored = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--colored');
var _MichaelCombs28$elm_mdl$Material_Button$plain = _MichaelCombs28$elm_mdl$Material_Options$nop;
var _MichaelCombs28$elm_mdl$Material_Button$disabled = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{disabled: true});
	});
var _MichaelCombs28$elm_mdl$Material_Button$ripple = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _MichaelCombs28$elm_mdl$Material_Button$onClick = function (x) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					onClick: _elm_lang$core$Maybe$Just(
						_elm_lang$html$Html_Events$onClick(x))
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Button$defaultConfig = {ripple: false, onClick: _elm_lang$core$Maybe$Nothing, disabled: false, type_: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Button$view = F4(
	function (lift, model, config, html) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Button$defaultConfig, config);
		var startListeners = summary.config.ripple ? {
			ctor: '::',
			_0: _elm_lang$core$Maybe$Just(
				A2(_MichaelCombs28$elm_mdl$Material_Ripple$downOn_, lift, 'mousedown')),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Maybe$Just(
					A2(_MichaelCombs28$elm_mdl$Material_Ripple$downOn_, lift, 'touchstart')),
				_1: {ctor: '[]'}
			}
		} : {ctor: '[]'};
		var stopListeners = function () {
			var handle = function (_p0) {
				return _elm_lang$core$Maybe$Just(
					(summary.config.ripple ? _MichaelCombs28$elm_mdl$Material_Button$blurAndForward : _MichaelCombs28$elm_mdl$Material_Helpers$blurOn)(_p0));
			};
			return {
				ctor: '::',
				_0: handle('mouseup'),
				_1: {
					ctor: '::',
					_0: handle('mouseleave'),
					_1: {
						ctor: '::',
						_0: handle('touchend'),
						_1: {ctor: '[]'}
					}
				}
			};
		}();
		var misc = {
			ctor: '::',
			_0: summary.config.onClick,
			_1: {
				ctor: '::',
				_0: summary.config.disabled ? _elm_lang$core$Maybe$Just(
					_elm_lang$html$Html_Attributes$disabled(true)) : _elm_lang$core$Maybe$Nothing,
				_1: {ctor: '[]'}
			}
		};
		var type_ = function () {
			var _p1 = summary.config.type_;
			if (_p1.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				return {
					ctor: '::',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$html$Html_Attributes$type_(_p1._0)),
					_1: {ctor: '[]'}
				};
			}
		}();
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-button'),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
							summary.config.ripple),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				_elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: startListeners,
						_1: {
							ctor: '::',
							_0: stopListeners,
							_1: {
								ctor: '::',
								_0: misc,
								_1: {
									ctor: '::',
									_0: type_,
									_1: {ctor: '[]'}
								}
							}
						}
					})),
			summary.config.ripple ? _elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: html,
					_1: {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								lift,
								A2(
									_MichaelCombs28$elm_mdl$Material_Ripple$view_,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('mdl-button__ripple-container'),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('blur'),
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('touchcancel'),
												_1: {ctor: '[]'}
											}
										}
									},
									model)),
							_1: {ctor: '[]'}
						},
						_1: {ctor: '[]'}
					}
				}) : html);
	});
var _MichaelCombs28$elm_mdl$Material_Button$update = function (action) {
	return _MichaelCombs28$elm_mdl$Material_Ripple$update(action);
};
var _MichaelCombs28$elm_mdl$Material_Button$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Button$view,
	_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Button$update),
	function (_) {
		return _.button;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{button: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Ripple$model);
var _MichaelCombs28$elm_mdl$Material_Button$defaultModel = _MichaelCombs28$elm_mdl$Material_Ripple$model;
var _MichaelCombs28$elm_mdl$Material_Button$Config = F4(
	function (a, b, c, d) {
		return {ripple: a, onClick: b, disabled: c, type_: d};
	});

var _MichaelCombs28$elm_mdl$Material_Icon$size48 = A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'font-size', '48px');
var _MichaelCombs28$elm_mdl$Material_Icon$size36 = A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'font-size', '36px');
var _MichaelCombs28$elm_mdl$Material_Icon$size24 = A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'font-size', '24px');
var _MichaelCombs28$elm_mdl$Material_Icon$size18 = A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'font-size', '18px');
var _MichaelCombs28$elm_mdl$Material_Icon$onClick = function (x) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onClick: _elm_lang$core$Maybe$Just(
						_elm_lang$html$Html_Events$onClick(x))
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Icon$defaultConfig = {onClick: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Icon$view = F2(
	function (name, options) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Icon$defaultConfig, options);
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$i,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('material-icons'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Maybe$withDefault,
				{ctor: '[]'},
				A2(
					_elm_lang$core$Maybe$map,
					A2(
						_elm_lang$core$Basics$flip,
						F2(
							function (x, y) {
								return {ctor: '::', _0: x, _1: y};
							}),
						{ctor: '[]'}),
					summary.config.onClick)),
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(name),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Icon$i = function (name) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Icon$view,
		name,
		{ctor: '[]'});
};
var _MichaelCombs28$elm_mdl$Material_Icon$Config = function (a) {
	return {onClick: a};
};

var _MichaelCombs28$elm_mdl$Material_Textfield$update = F2(
	function (action, model) {
		var _p0 = action;
		switch (_p0.ctor) {
			case 'Input':
				return _elm_lang$core$Native_Utils.update(
					model,
					{value: _p0._0});
			case 'Blur':
				return _elm_lang$core$Native_Utils.update(
					model,
					{isFocused: false});
			default:
				return _elm_lang$core$Native_Utils.update(
					model,
					{isFocused: true});
		}
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$defaultModel = {isFocused: false, value: ''};
var _MichaelCombs28$elm_mdl$Material_Textfield$cols = function (cols) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					cols: _elm_lang$core$Maybe$Just(cols)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$rows = function (rows) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					rows: _elm_lang$core$Maybe$Just(rows)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$style = _MichaelCombs28$elm_mdl$Material_Options$inner;
var _MichaelCombs28$elm_mdl$Material_Textfield$on = F2(
	function (event, decoder) {
		return _MichaelCombs28$elm_mdl$Material_Options$set(
			function (config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						listeners: A2(
							_elm_lang$core$Basics_ops['++'],
							config.listeners,
							{
								ctor: '::',
								_0: A2(_elm_lang$html$Html_Events$on, event, decoder),
								_1: {ctor: '[]'}
							})
					});
			});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$onInput = function (f) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Textfield$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, f, _elm_lang$html$Html_Events$targetValue));
};
var _MichaelCombs28$elm_mdl$Material_Textfield$onBlur = function (f) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Textfield$on,
		'focusout',
		_elm_lang$core$Json_Decode$succeed(f));
};
var _MichaelCombs28$elm_mdl$Material_Textfield$onFocus = function (f) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Textfield$on,
		'focusin',
		_elm_lang$core$Json_Decode$succeed(f));
};
var _MichaelCombs28$elm_mdl$Material_Textfield$disabled = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$maxlength = function (v) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					maxlength: _elm_lang$core$Maybe$Just(v)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$autofocus = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{autofocus: true});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$value = function (str) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					value: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$error = function (str) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					error: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$expandableIcon = function (id) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{expandableIcon: id});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$expandable = function (id) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					expandable: _elm_lang$core$Maybe$Just(id)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$floatingLabel = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{labelFloat: true});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$label = function (str) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					labelText: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$Config = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return {labelText: a, labelFloat: b, error: c, value: d, disabled: e, kind: f, rows: g, cols: h, autofocus: i, maxlength: j, inner: k, listeners: l, expandable: m, expandableIcon: n};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _MichaelCombs28$elm_mdl$Material_Textfield$Model = F2(
	function (a, b) {
		return {isFocused: a, value: b};
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$Password = {ctor: 'Password'};
var _MichaelCombs28$elm_mdl$Material_Textfield$password = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _MichaelCombs28$elm_mdl$Material_Textfield$Password});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$Textarea = {ctor: 'Textarea'};
var _MichaelCombs28$elm_mdl$Material_Textfield$textarea = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _MichaelCombs28$elm_mdl$Material_Textfield$Textarea});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$Text = {ctor: 'Text'};
var _MichaelCombs28$elm_mdl$Material_Textfield$defaultConfig = {
	labelText: _elm_lang$core$Maybe$Nothing,
	labelFloat: false,
	error: _elm_lang$core$Maybe$Nothing,
	value: _elm_lang$core$Maybe$Nothing,
	disabled: false,
	kind: _MichaelCombs28$elm_mdl$Material_Textfield$Text,
	rows: _elm_lang$core$Maybe$Nothing,
	cols: _elm_lang$core$Maybe$Nothing,
	autofocus: false,
	maxlength: _elm_lang$core$Maybe$Nothing,
	inner: {ctor: '[]'},
	listeners: {ctor: '[]'},
	expandable: _elm_lang$core$Maybe$Nothing,
	expandableIcon: 'search'
};
var _MichaelCombs28$elm_mdl$Material_Textfield$text_ = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _MichaelCombs28$elm_mdl$Material_Textfield$Text});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Textfield$Focus = {ctor: 'Focus'};
var _MichaelCombs28$elm_mdl$Material_Textfield$Blur = {ctor: 'Blur'};
var _MichaelCombs28$elm_mdl$Material_Textfield$view = F3(
	function (lift, model, options) {
		var _p1 = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Textfield$defaultConfig, options);
		var summary = _p1;
		var config = _p1.config;
		var val = A2(_elm_lang$core$Maybe$withDefault, model.value, config.value);
		var isTextarea = _elm_lang$core$Native_Utils.eq(config.kind, _MichaelCombs28$elm_mdl$Material_Textfield$Textarea);
		var elementFunction = isTextarea ? _elm_lang$html$Html$textarea : _elm_lang$html$Html$input;
		var typeAttributes = function () {
			var _p2 = config.kind;
			switch (_p2.ctor) {
				case 'Text':
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('text'),
						_1: {ctor: '[]'}
					};
				case 'Password':
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('password'),
						_1: {ctor: '[]'}
					};
				default:
					return A2(
						_elm_lang$core$Basics_ops['++'],
						{ctor: '[]'},
						A2(
							_elm_lang$core$Basics_ops['++'],
							function () {
								var _p3 = config.rows;
								if (_p3.ctor === 'Just') {
									return {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$rows(_p3._0),
										_1: {ctor: '[]'}
									};
								} else {
									return {ctor: '[]'};
								}
							}(),
							function () {
								var _p4 = config.cols;
								if (_p4.ctor === 'Just') {
									return {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$cols(_p4._0),
										_1: {ctor: '[]'}
									};
								} else {
									return {ctor: '[]'};
								}
							}()));
			}
		}();
		var maxlength = function () {
			var _p5 = config.maxlength;
			if (_p5.ctor === 'Just') {
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$maxlength(_p5._0),
					_1: {ctor: '[]'}
				};
			} else {
				return {ctor: '[]'};
			}
		}();
		var listeners = config.listeners;
		var textValue = function () {
			var _p6 = config.value;
			if (_p6.ctor === 'Just') {
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$value(_p6._0),
					_1: {ctor: '[]'}
				};
			} else {
				return {ctor: '[]'};
			}
		}();
		var defaultInput = function () {
			var _p7 = config.value;
			if (_p7.ctor === 'Just') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(
					A2(
						_elm_lang$html$Html_Events$on,
						'input',
						A2(
							_elm_lang$core$Json_Decode$map,
							function (_p8) {
								return lift(
									_MichaelCombs28$elm_mdl$Material_Textfield$Input(_p8));
							},
							_elm_lang$html$Html_Events$targetValue)));
			}
		}();
		var labelFor = function () {
			var _p9 = config.expandable;
			if (_p9.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$for(_p9._0),
					_1: {ctor: '[]'}
				};
			}
		}();
		var expandableId = function () {
			var _p10 = config.expandable;
			if (_p10.ctor === 'Nothing') {
				return _MichaelCombs28$elm_mdl$Material_Options$nop;
			} else {
				return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
					_elm_lang$html$Html_Attributes$id(_p10._0));
			}
		}();
		var expHolder = function () {
			var _p11 = config.expandable;
			if (_p11.ctor === 'Nothing') {
				return _elm_lang$core$Basics$identity;
			} else {
				return function (x) {
					return {
						ctor: '::',
						_0: A4(
							_MichaelCombs28$elm_mdl$Material_Options$styled_,
							_elm_lang$html$Html$label,
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-button'),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--icon'),
										_1: {ctor: '[]'}
									}
								}
							},
							labelFor,
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Icon$i(config.expandableIcon),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_MichaelCombs28$elm_mdl$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield__expandable-holder'),
									_1: {ctor: '[]'}
								},
								x),
							_1: {ctor: '[]'}
						}
					};
				};
			}
		}();
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-textfield'),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('is-upgraded'),
						_1: {
							ctor: '::',
							_0: config.labelFloat ? _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield--floating-label') : _MichaelCombs28$elm_mdl$Material_Options$nop,
							_1: {
								ctor: '::',
								_0: (!_elm_lang$core$Native_Utils.eq(config.error, _elm_lang$core$Maybe$Nothing)) ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-invalid') : _MichaelCombs28$elm_mdl$Material_Options$nop,
								_1: {
									ctor: '::',
									_0: (!_elm_lang$core$Native_Utils.eq(val, '')) ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-dirty') : _MichaelCombs28$elm_mdl$Material_Options$nop,
									_1: {
										ctor: '::',
										_0: (model.isFocused && (!config.disabled)) ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-focused') : _MichaelCombs28$elm_mdl$Material_Options$nop,
										_1: {
											ctor: '::',
											_0: config.disabled ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-disabled') : _MichaelCombs28$elm_mdl$Material_Options$nop,
											_1: {
												ctor: '::',
												_0: A2(
													_MichaelCombs28$elm_mdl$Material_Options$when,
													_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield--expandable'),
													!_elm_lang$core$Native_Utils.eq(config.expandable, _elm_lang$core$Maybe$Nothing)),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: defaultInput,
					_1: {ctor: '[]'}
				}),
			expHolder(
				{
					ctor: '::',
					_0: A4(
						_MichaelCombs28$elm_mdl$Material_Options$styled_,
						elementFunction,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield__input'),
							_1: {
								ctor: '::',
								_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'outline', 'none'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
										A2(
											_elm_lang$html$Html_Events$on,
											'focus',
											_elm_lang$core$Json_Decode$succeed(
												lift(_MichaelCombs28$elm_mdl$Material_Textfield$Focus)))),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
											A2(
												_elm_lang$html$Html_Events$on,
												'blur',
												_elm_lang$core$Json_Decode$succeed(
													lift(_MichaelCombs28$elm_mdl$Material_Textfield$Blur)))),
										_1: {
											ctor: '::',
											_0: expandableId,
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Options$many(config.inner),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						},
						A2(
							_elm_lang$core$Basics_ops['++'],
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$disabled(config.disabled),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$autofocus(config.autofocus),
									_1: {ctor: '[]'}
								}
							},
							A2(
								_elm_lang$core$Basics_ops['++'],
								textValue,
								A2(
									_elm_lang$core$Basics_ops['++'],
									typeAttributes,
									A2(_elm_lang$core$Basics_ops['++'], maxlength, listeners)))),
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$label,
							A2(
								_elm_lang$core$Basics_ops['++'],
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-textfield__label'),
									_1: {ctor: '[]'}
								},
								labelFor),
							function () {
								var _p12 = config.labelText;
								if (_p12.ctor === 'Just') {
									return {
										ctor: '::',
										_0: _elm_lang$html$Html$text(_p12._0),
										_1: {ctor: '[]'}
									};
								} else {
									return {ctor: '[]'};
								}
							}()),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Maybe$withDefault,
								A2(
									_elm_lang$html$Html$div,
									{ctor: '[]'},
									{ctor: '[]'}),
								A2(
									_elm_lang$core$Maybe$map,
									function (e) {
										return A2(
											_elm_lang$html$Html$span,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('mdl-textfield__error'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(e),
												_1: {ctor: '[]'}
											});
									},
									config.error)),
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Textfield$view,
	F3(
		function (_p13, msg, model) {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					A2(_MichaelCombs28$elm_mdl$Material_Textfield$update, msg, model)),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}),
	function (_) {
		return _.textfield;
	},
	F2(
		function (x, c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{textfield: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Textfield$defaultModel);

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$mouse$Mouse_ops = _elm_lang$mouse$Mouse_ops || {};
_elm_lang$mouse$Mouse_ops['&>'] = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return t2;
			},
			t1);
	});
var _elm_lang$mouse$Mouse$onSelfMsg = F3(
	function (router, _p1, state) {
		var _p2 = _p1;
		var _p3 = A2(_elm_lang$core$Dict$get, _p2.category, state);
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p2.position));
			};
			return A2(
				_elm_lang$mouse$Mouse_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p3._0.taggers)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$mouse$Mouse$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$mouse$Mouse$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p4 = maybeValues;
		if (_p4.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p4._0});
		}
	});
var _elm_lang$mouse$Mouse$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p5 = subs;
			if (_p5.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p5._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p5._0._0,
					_elm_lang$mouse$Mouse$categorizeHelpHelp(_p5._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$mouse$Mouse$categorize = function (subs) {
	return A2(_elm_lang$mouse$Mouse$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$mouse$Mouse$subscription = _elm_lang$core$Native_Platform.leaf('Mouse');
var _elm_lang$mouse$Mouse$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _elm_lang$mouse$Mouse$position = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$mouse$Mouse$Position,
	A2(_elm_lang$core$Json_Decode$field, 'pageX', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'pageY', _elm_lang$core$Json_Decode$int));
var _elm_lang$mouse$Mouse$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$mouse$Mouse$Msg = F2(
	function (a, b) {
		return {category: a, position: b};
	});
var _elm_lang$mouse$Mouse$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				var tracker = A3(
					_elm_lang$dom$Dom_LowLevel$onDocument,
					category,
					_elm_lang$mouse$Mouse$position,
					function (_p6) {
						return A2(
							_elm_lang$core$Platform$sendToSelf,
							router,
							A2(_elm_lang$mouse$Mouse$Msg, category, _p6));
					});
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$mouse$Mouse$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(tracker));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p7, taggers, task) {
				var _p8 = _p7;
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$core$Dict$insert,
								category,
								A2(_elm_lang$mouse$Mouse$Watcher, taggers, _p8.pid),
								state));
					},
					task);
			});
		var leftStep = F3(
			function (category, _p9, task) {
				var _p10 = _p9;
				return A2(
					_elm_lang$mouse$Mouse_ops['&>'],
					_elm_lang$core$Process$kill(_p10.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$mouse$Mouse$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$mouse$Mouse$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$mouse$Mouse$clicks = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'click', tagger));
};
var _elm_lang$mouse$Mouse$moves = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousemove', tagger));
};
var _elm_lang$mouse$Mouse$downs = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousedown', tagger));
};
var _elm_lang$mouse$Mouse$ups = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mouseup', tagger));
};
var _elm_lang$mouse$Mouse$subMap = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return A2(
			_elm_lang$mouse$Mouse$MySub,
			_p12._0,
			function (_p13) {
				return func(
					_p12._1(_p13));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Mouse'] = {pkg: 'elm-lang/mouse', init: _elm_lang$mouse$Mouse$init, onEffects: _elm_lang$mouse$Mouse$onEffects, onSelfMsg: _elm_lang$mouse$Mouse$onSelfMsg, tag: 'sub', subMap: _elm_lang$mouse$Mouse$subMap};

var _MichaelCombs28$elm_mdl$Material_Menu_Geometry$Geometry = F5(
	function (a, b, c, d, e) {
		return {button: a, menu: b, container: c, offsetTops: d, offsetHeights: e};
	});
var _MichaelCombs28$elm_mdl$Material_Menu_Geometry$Element = F4(
	function (a, b, c, d) {
		return {offsetTop: a, offsetLeft: b, offsetHeight: c, bounds: d};
	});
var _MichaelCombs28$elm_mdl$Material_Menu_Geometry$element = A5(_elm_lang$core$Json_Decode$map4, _MichaelCombs28$elm_mdl$Material_Menu_Geometry$Element, _MichaelCombs28$elm_dom$DOM$offsetTop, _MichaelCombs28$elm_dom$DOM$offsetLeft, _MichaelCombs28$elm_dom$DOM$offsetHeight, _MichaelCombs28$elm_dom$DOM$boundingClientRect);
var _MichaelCombs28$elm_mdl$Material_Menu_Geometry$decode = A6(
	_elm_lang$core$Json_Decode$map5,
	_MichaelCombs28$elm_mdl$Material_Menu_Geometry$Geometry,
	_MichaelCombs28$elm_dom$DOM$target(_MichaelCombs28$elm_mdl$Material_Menu_Geometry$element),
	_MichaelCombs28$elm_dom$DOM$target(
		_MichaelCombs28$elm_dom$DOM$nextSibling(
			A2(_MichaelCombs28$elm_dom$DOM$childNode, 1, _MichaelCombs28$elm_mdl$Material_Menu_Geometry$element))),
	_MichaelCombs28$elm_dom$DOM$target(
		_MichaelCombs28$elm_dom$DOM$nextSibling(_MichaelCombs28$elm_mdl$Material_Menu_Geometry$element)),
	_MichaelCombs28$elm_dom$DOM$target(
		_MichaelCombs28$elm_dom$DOM$nextSibling(
			A2(
				_MichaelCombs28$elm_dom$DOM$childNode,
				1,
				_MichaelCombs28$elm_dom$DOM$childNodes(_MichaelCombs28$elm_dom$DOM$offsetTop)))),
	_MichaelCombs28$elm_dom$DOM$target(
		_MichaelCombs28$elm_dom$DOM$nextSibling(
			A2(
				_MichaelCombs28$elm_dom$DOM$childNode,
				1,
				_MichaelCombs28$elm_dom$DOM$childNodes(_MichaelCombs28$elm_dom$DOM$offsetHeight)))));

var _MichaelCombs28$elm_mdl$Material_Menu$toPx = function (_p0) {
	return A3(
		_elm_lang$core$Basics$flip,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'px',
		_elm_lang$core$Basics$toString(_p0));
};
var _MichaelCombs28$elm_mdl$Material_Menu$rect = F4(
	function (x, y, w, h) {
		return function (coords) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'rect(',
				A2(_elm_lang$core$Basics_ops['++'], coords, ')'));
		}(
			A2(
				_elm_lang$core$String$join,
				' ',
				A2(
					_elm_lang$core$List$map,
					_MichaelCombs28$elm_mdl$Material_Menu$toPx,
					{
						ctor: '::',
						_0: x,
						_1: {
							ctor: '::',
							_0: y,
							_1: {
								ctor: '::',
								_0: w,
								_1: {
									ctor: '::',
									_0: h,
									_1: {ctor: '[]'}
								}
							}
						}
					})));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$onKeyDown = function (action) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'keydown',
		{preventDefault: true, stopPropagation: false},
		A2(_elm_lang$core$Json_Decode$map, action, _elm_lang$html$Html_Events$keyCode));
};
var _MichaelCombs28$elm_mdl$Material_Menu$onClick = F2(
	function (decoder, action) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'click',
			A2(_elm_lang$core$Json_Decode$map, action, decoder));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$withGeometry = F2(
	function (model, f) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			_MichaelCombs28$elm_mdl$Material_Options$nop,
			A2(_elm_lang$core$Maybe$map, f, model.geometry));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$icon = function (name) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{icon: name});
		});
};
var _MichaelCombs28$elm_mdl$Material_Menu$ripple = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{ripple: true});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$onSelect = function (msg) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onSelect: _elm_lang$core$Maybe$Just(msg)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Menu$disabled = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{enabled: false});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$divider = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{divider: true});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$defaultItemConfig = {enabled: true, divider: false, onSelect: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Menu$constant = {transitionDurationSeconds: 0.3, transitionDurationFraction: 0.8, closeTimeout: 150};
var _MichaelCombs28$elm_mdl$Material_Menu$transitionDuration = _MichaelCombs28$elm_mdl$Material_Menu$constant.transitionDurationSeconds * _MichaelCombs28$elm_mdl$Material_Menu$constant.transitionDurationFraction;
var _MichaelCombs28$elm_mdl$Material_Menu$Model = F4(
	function (a, b, c, d) {
		return {ripples: a, animationState: b, geometry: c, index: d};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Item = F2(
	function (a, b) {
		return {options: a, html: b};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$item = _MichaelCombs28$elm_mdl$Material_Menu$Item;
var _MichaelCombs28$elm_mdl$Material_Menu$ItemConfig = F3(
	function (a, b, c) {
		return {enabled: a, divider: b, onSelect: c};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Config = F3(
	function (a, b, c) {
		return {alignment: a, ripple: b, icon: c};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Closing = {ctor: 'Closing'};
var _MichaelCombs28$elm_mdl$Material_Menu$Opened = {ctor: 'Opened'};
var _MichaelCombs28$elm_mdl$Material_Menu$clip = F3(
	function (model, config, geometry) {
		var height = geometry.menu.bounds.height;
		var width = geometry.menu.bounds.width;
		return A2(
			_MichaelCombs28$elm_mdl$Material_Options$css,
			'clip',
			function () {
				if (_elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened) || _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Closing)) {
					return A4(_MichaelCombs28$elm_mdl$Material_Menu$rect, 0, width, height, 0);
				} else {
					var _p1 = config.alignment;
					switch (_p1.ctor) {
						case 'BottomRight':
							return A4(_MichaelCombs28$elm_mdl$Material_Menu$rect, 0, width, 0, width);
						case 'TopLeft':
							return A4(_MichaelCombs28$elm_mdl$Material_Menu$rect, height, 0, height, 0);
						case 'TopRight':
							return A4(_MichaelCombs28$elm_mdl$Material_Menu$rect, height, width, height, width);
						default:
							return '';
					}
				}
			}());
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Opening = {ctor: 'Opening'};
var _MichaelCombs28$elm_mdl$Material_Menu$isActive = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened) || _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opening);
};
var _MichaelCombs28$elm_mdl$Material_Menu$Idle = {ctor: 'Idle'};
var _MichaelCombs28$elm_mdl$Material_Menu$defaultModel = {ripples: _elm_lang$core$Dict$empty, animationState: _MichaelCombs28$elm_mdl$Material_Menu$Idle, geometry: _elm_lang$core$Maybe$Nothing, index: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Menu$Key = F2(
	function (a, b) {
		return {ctor: 'Key', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Click = function (a) {
	return {ctor: 'Click', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Menu$subscriptions = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened) ? _elm_lang$mouse$Mouse$clicks(_MichaelCombs28$elm_mdl$Material_Menu$Click) : _elm_lang$core$Platform_Sub$none;
};
var _MichaelCombs28$elm_mdl$Material_Menu$Ripple = F2(
	function (a, b) {
		return {ctor: 'Ripple', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Tick = {ctor: 'Tick'};
var _MichaelCombs28$elm_mdl$Material_Menu$Close = {ctor: 'Close'};
var _MichaelCombs28$elm_mdl$Material_Menu$Select = F2(
	function (a, b) {
		return {ctor: 'Select', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$update = F3(
	function (fwd, msg, model) {
		update:
		while (true) {
			var _p2 = msg;
			switch (_p2.ctor) {
				case 'Open':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								animationState: function () {
									var _p3 = model.animationState;
									if (_p3.ctor === 'Opened') {
										return _MichaelCombs28$elm_mdl$Material_Menu$Opened;
									} else {
										return _MichaelCombs28$elm_mdl$Material_Menu$Opening;
									}
								}(),
								geometry: _elm_lang$core$Maybe$Just(_p2._0)
							}),
						_1: _MichaelCombs28$elm_mdl$Material_Helpers$cmd(
							fwd(_MichaelCombs28$elm_mdl$Material_Menu$Tick))
					};
				case 'Tick':
					return _MichaelCombs28$elm_mdl$Material_Helpers$pure(
						_elm_lang$core$Native_Utils.update(
							model,
							{animationState: _MichaelCombs28$elm_mdl$Material_Menu$Opened}));
				case 'Close':
					return _MichaelCombs28$elm_mdl$Material_Helpers$pure(
						_elm_lang$core$Native_Utils.update(
							model,
							{animationState: _MichaelCombs28$elm_mdl$Material_Menu$Idle, geometry: _elm_lang$core$Maybe$Nothing, index: _elm_lang$core$Maybe$Nothing}));
				case 'Select':
					var cmds = A2(
						_elm_lang$core$List$filterMap,
						_elm_lang$core$Basics$identity,
						{
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								A2(
									_MichaelCombs28$elm_mdl$Material_Helpers$delay,
									_MichaelCombs28$elm_mdl$Material_Menu$constant.closeTimeout,
									fwd(_MichaelCombs28$elm_mdl$Material_Menu$Close))),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Maybe$map, _MichaelCombs28$elm_mdl$Material_Helpers$cmd, _p2._1),
								_1: {ctor: '[]'}
							}
						});
					var model_ = _elm_lang$core$Native_Utils.update(
						model,
						{animationState: _MichaelCombs28$elm_mdl$Material_Menu$Closing});
					return {
						ctor: '_Tuple2',
						_0: model_,
						_1: _elm_lang$core$Platform_Cmd$batch(cmds)
					};
				case 'Ripple':
					var _p6 = _p2._0;
					var _p4 = A2(
						_MichaelCombs28$elm_mdl$Material_Ripple$update,
						_p2._1,
						A2(
							_elm_lang$core$Maybe$withDefault,
							_MichaelCombs28$elm_mdl$Material_Ripple$model,
							A2(_elm_lang$core$Dict$get, _p6, model.ripples)));
					var model_ = _p4._0;
					var effects = _p4._1;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								ripples: A3(_elm_lang$core$Dict$insert, _p6, model_, model.ripples)
							}),
						_1: A2(
							_elm_lang$core$Platform_Cmd$map,
							function (_p5) {
								return fwd(
									A2(_MichaelCombs28$elm_mdl$Material_Menu$Ripple, _p6, _p5));
							},
							effects)
					};
				case 'Click':
					if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
						var _p7 = model.geometry;
						if (_p7.ctor === 'Just') {
							var inside = F2(
								function (_p9, _p8) {
									var _p10 = _p9;
									var _p15 = _p10.y;
									var _p14 = _p10.x;
									var _p11 = _p8;
									var _p13 = _p11.top;
									var _p12 = _p11.left;
									return (_elm_lang$core$Native_Utils.cmp(
										_p12,
										_elm_lang$core$Basics$toFloat(_p14)) < 1) && ((_elm_lang$core$Native_Utils.cmp(
										_elm_lang$core$Basics$toFloat(_p14),
										_p12 + _p11.width) < 1) && ((_elm_lang$core$Native_Utils.cmp(
										_p13,
										_elm_lang$core$Basics$toFloat(_p15)) < 1) && (_elm_lang$core$Native_Utils.cmp(
										_elm_lang$core$Basics$toFloat(_p15),
										_p13 + _p11.height) < 1)));
								});
							if (A2(inside, _p2._0, _p7._0.menu.bounds)) {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							} else {
								var _v6 = fwd,
									_v7 = _MichaelCombs28$elm_mdl$Material_Menu$Close,
									_v8 = model;
								fwd = _v6;
								msg = _v7;
								model = _v8;
								continue update;
							}
						} else {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{ctor: '[]'});
						}
					} else {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					}
				default:
					var _p24 = _p2._0;
					var _p16 = _p2._1;
					switch (_p16) {
						case 13:
							if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
								var _p17 = model.index;
								if (_p17.ctor === 'Just') {
									var _p19 = _p17._0;
									var cmd = A2(
										_elm_lang$core$Maybe$andThen,
										function (_p18) {
											return function (_) {
												return _.onSelect;
											}(
												function (_) {
													return _.config;
												}(_p18));
										},
										_elm_lang$core$List$head(
											A2(_elm_lang$core$List$drop, _p19, _p24)));
									var _v11 = fwd,
										_v12 = A2(_MichaelCombs28$elm_mdl$Material_Menu$Select, _p19 + 1, cmd),
										_v13 = model;
									fwd = _v11;
									msg = _v12;
									model = _v13;
									continue update;
								} else {
									var _v14 = fwd,
										_v15 = _MichaelCombs28$elm_mdl$Material_Menu$Close,
										_v16 = model;
									fwd = _v14;
									msg = _v15;
									model = _v16;
									continue update;
								}
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						case 27:
							var _v17 = fwd,
								_v18 = _MichaelCombs28$elm_mdl$Material_Menu$Close,
								_v19 = model;
							fwd = _v17;
							msg = _v18;
							model = _v19;
							continue update;
						case 32:
							if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
								var _v20 = fwd,
									_v21 = A2(_MichaelCombs28$elm_mdl$Material_Menu$Key, _p24, 13),
									_v22 = model;
								fwd = _v20;
								msg = _v21;
								model = _v22;
								continue update;
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						case 40:
							if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
								var items = A2(
									_elm_lang$core$List$indexedMap,
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										}),
									_p24);
								return A3(
									_elm_lang$core$Basics$flip,
									F2(
										function (x, y) {
											return A2(_elm_lang$core$Platform_Cmd_ops['!'], x, y);
										}),
									{ctor: '[]'},
									A2(
										_elm_lang$core$Maybe$withDefault,
										model,
										A2(
											_elm_lang$core$Maybe$map,
											function (_p20) {
												return function (index_) {
													return _elm_lang$core$Native_Utils.update(
														model,
														{
															index: _elm_lang$core$Maybe$Just(index_)
														});
												}(
													_elm_lang$core$Tuple$first(_p20));
											},
											_elm_lang$core$List$head(
												A2(
													_elm_lang$core$List$filter,
													function (_p21) {
														return function (_) {
															return _.enabled;
														}(
															function (_) {
																return _.config;
															}(
																_elm_lang$core$Tuple$second(_p21)));
													},
													A2(
														_elm_lang$core$List$drop,
														1 + A2(_elm_lang$core$Maybe$withDefault, -1, model.index),
														A2(_elm_lang$core$Basics_ops['++'], items, items)))))));
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						case 38:
							if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
								var items = A2(
									_elm_lang$core$List$indexedMap,
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										}),
									_p24);
								return _MichaelCombs28$elm_mdl$Material_Helpers$pure(
									A2(
										_elm_lang$core$Maybe$withDefault,
										model,
										A2(
											_elm_lang$core$Maybe$map,
											function (_p22) {
												return function (index_) {
													return _elm_lang$core$Native_Utils.update(
														model,
														{
															index: _elm_lang$core$Maybe$Just(index_)
														});
												}(
													_elm_lang$core$Tuple$first(_p22));
											},
											_elm_lang$core$List$head(
												A2(
													_elm_lang$core$List$filter,
													function (_p23) {
														return function (_) {
															return _.enabled;
														}(
															function (_) {
																return _.config;
															}(
																_elm_lang$core$Tuple$second(_p23)));
													},
													A2(
														_elm_lang$core$List$drop,
														_elm_lang$core$List$length(_p24) - A2(_elm_lang$core$Maybe$withDefault, 0, model.index),
														_elm_lang$core$List$reverse(
															A2(_elm_lang$core$Basics_ops['++'], items, items))))))));
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						default:
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{ctor: '[]'});
					}
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Menu$update_ = F3(
	function (fwd, msg, model) {
		return _MichaelCombs28$elm_mdl$Material_Helpers$partsUpdatePort(
			_elm_lang$core$Maybe$Just(
				A3(_MichaelCombs28$elm_mdl$Material_Menu$update, fwd, msg, model)));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$pack = A4(
	_MichaelCombs28$elm_parts$Parts$pack,
	_MichaelCombs28$elm_mdl$Material_Menu$update_,
	function (_) {
		return _.menu;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{menu: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Menu$defaultModel);
var _MichaelCombs28$elm_mdl$Material_Menu$subs = function (lift) {
	return function (_p25) {
		return _elm_lang$core$Platform_Sub$batch(
			A3(
				_elm_lang$core$Dict$foldl,
				F3(
					function (idx, model, ss) {
						return {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Platform_Sub$map,
								A2(_MichaelCombs28$elm_mdl$Material_Menu$pack, lift, idx),
								_MichaelCombs28$elm_mdl$Material_Menu$subscriptions(model)),
							_1: ss
						};
					}),
				{ctor: '[]'},
				function (_) {
					return _.menu;
				}(_p25)));
	};
};
var _MichaelCombs28$elm_mdl$Material_Menu$Open = function (a) {
	return {ctor: 'Open', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Menu$TopRight = {ctor: 'TopRight'};
var _MichaelCombs28$elm_mdl$Material_Menu$topRight = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _MichaelCombs28$elm_mdl$Material_Menu$TopRight});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$TopLeft = {ctor: 'TopLeft'};
var _MichaelCombs28$elm_mdl$Material_Menu$topLeft = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _MichaelCombs28$elm_mdl$Material_Menu$TopLeft});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$delay = F4(
	function (alignment, height, offsetTop, offsetHeight) {
		var t = (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopLeft) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopRight)) ? ((((height - offsetTop) - offsetHeight) / height) * _MichaelCombs28$elm_mdl$Material_Menu$transitionDuration) : ((offsetTop / height) * _MichaelCombs28$elm_mdl$Material_Menu$transitionDuration);
		return A2(
			_MichaelCombs28$elm_mdl$Material_Options$css,
			'transition-delay',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(t),
				's'));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$view1 = F8(
	function (lift, config, model, offsetTop, offsetHeight, index, summary, item) {
		var canSelect = summary.config.enabled && (!_elm_lang$core$Native_Utils.eq(summary.config.onSelect, _elm_lang$core$Maybe$Nothing));
		var hasRipple = config.ripple && canSelect;
		var ripple = function (_p26) {
			return lift(
				A2(_MichaelCombs28$elm_mdl$Material_Menu$Ripple, index, _p26));
		};
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$li,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu__item'),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$when,
						_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
						config.ripple),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu__item--full-bleed-divider'),
							summary.config.divider),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'background-color', 'rgb(238,238,238)'),
								_elm_lang$core$Native_Utils.eq(
									model.index,
									_elm_lang$core$Maybe$Just(index))),
							_1: {
								ctor: '::',
								_0: function () {
									var _p27 = {
										ctor: '_Tuple2',
										_0: model.geometry,
										_1: _MichaelCombs28$elm_mdl$Material_Menu$isActive(model)
									};
									if (((_p27.ctor === '_Tuple2') && (_p27._0.ctor === 'Just')) && (_p27._1 === true)) {
										return A4(_MichaelCombs28$elm_mdl$Material_Menu$delay, config.alignment, _p27._0._0.menu.bounds.height, offsetTop, offsetHeight);
									} else {
										return _MichaelCombs28$elm_mdl$Material_Options$nop;
									}
								}(),
								_1: {
									ctor: '::',
									_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'display', 'flex'),
									_1: {
										ctor: '::',
										_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'align-items', 'center'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$List$filterMap,
					_elm_lang$core$Basics$identity,
					{
						ctor: '::',
						_0: canSelect ? _elm_lang$core$Maybe$Just(
							_elm_lang$html$Html_Events$onClick(
								lift(
									A2(_MichaelCombs28$elm_mdl$Material_Menu$Select, index, summary.config.onSelect)))) : _elm_lang$core$Maybe$Nothing,
						_1: {
							ctor: '::',
							_0: (!summary.config.enabled) ? _elm_lang$core$Maybe$Just(
								A2(_elm_lang$html$Html_Attributes$attribute, 'disabled', 'disabled')) : _elm_lang$core$Maybe$Nothing,
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Maybe$Just(
									A2(
										_elm_lang$html$Html_Attributes$property,
										'tabindex',
										_elm_lang$core$Json_Encode$string('-1'))),
								_1: {ctor: '[]'}
							}
						}
					}),
				hasRipple ? {
					ctor: '::',
					_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$downOn_, ripple, 'mousedown'),
					_1: {
						ctor: '::',
						_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$downOn_, ripple, 'touchstart'),
						_1: {
							ctor: '::',
							_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$upOn_, ripple, 'mouseup'),
							_1: {
								ctor: '::',
								_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$upOn_, ripple, 'mouseleave'),
								_1: {
									ctor: '::',
									_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$upOn_, ripple, 'touchend'),
									_1: {
										ctor: '::',
										_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$upOn_, ripple, 'blur'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				} : {ctor: '[]'}),
			hasRipple ? A2(
				F2(
					function (x, y) {
						return A2(_elm_lang$core$Basics_ops['++'], x, y);
					}),
				item.html,
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$map,
						ripple,
						A2(
							_MichaelCombs28$elm_mdl$Material_Ripple$view_,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-menu__item-ripple-container'),
								_1: {ctor: '[]'}
							},
							A2(
								_elm_lang$core$Maybe$withDefault,
								_MichaelCombs28$elm_mdl$Material_Ripple$model,
								A2(_elm_lang$core$Dict$get, index, model.ripples)))),
					_1: {ctor: '[]'}
				}) : item.html);
	});
var _MichaelCombs28$elm_mdl$Material_Menu$BottomRight = {ctor: 'BottomRight'};
var _MichaelCombs28$elm_mdl$Material_Menu$bottomRight = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _MichaelCombs28$elm_mdl$Material_Menu$BottomRight});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft = {ctor: 'BottomLeft'};
var _MichaelCombs28$elm_mdl$Material_Menu$defaultConfig = {alignment: _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft, ripple: false, icon: 'more_vert'};
var _MichaelCombs28$elm_mdl$Material_Menu$bottomLeft = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$containerGeometry = F2(
	function (alignment, geometry) {
		return _MichaelCombs28$elm_mdl$Material_Options$many(
			{
				ctor: '::',
				_0: A2(
					_MichaelCombs28$elm_mdl$Material_Options$css,
					'width',
					_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.bounds.width)),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$css,
						'height',
						_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.bounds.height)),
					_1: {
						ctor: '::',
						_0: (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$BottomRight) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft)) ? A2(
							_MichaelCombs28$elm_mdl$Material_Options$css,
							'top',
							_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.button.offsetTop + geometry.button.offsetHeight)) : _MichaelCombs28$elm_mdl$Material_Options$nop,
						_1: {
							ctor: '::',
							_0: function () {
								if (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$BottomRight) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopRight)) {
									var right = function (e) {
										return e.bounds.left + e.bounds.width;
									};
									return A2(
										_MichaelCombs28$elm_mdl$Material_Options$css,
										'right',
										_MichaelCombs28$elm_mdl$Material_Menu$toPx(
											right(geometry.container) - right(geometry.menu)));
								} else {
									return _MichaelCombs28$elm_mdl$Material_Options$nop;
								}
							}(),
							_1: {
								ctor: '::',
								_0: function () {
									if (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopLeft) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopRight)) {
										var bottom = geometry.container.bounds.top + geometry.container.bounds.height;
										return A2(
											_MichaelCombs28$elm_mdl$Material_Options$css,
											'bottom',
											_MichaelCombs28$elm_mdl$Material_Menu$toPx(bottom - geometry.button.bounds.top));
									} else {
										return _MichaelCombs28$elm_mdl$Material_Options$nop;
									}
								}(),
								_1: {
									ctor: '::',
									_0: (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopLeft) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft)) ? A2(
										_MichaelCombs28$elm_mdl$Material_Options$css,
										'left',
										_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.offsetLeft)) : _MichaelCombs28$elm_mdl$Material_Options$nop,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$view = F4(
	function (lift, model, properties, items) {
		var itemSummaries = A2(
			_elm_lang$core$List$map,
			function (_p28) {
				return A2(
					_MichaelCombs28$elm_mdl$Material_Options$collect,
					_MichaelCombs28$elm_mdl$Material_Menu$defaultItemConfig,
					function (_) {
						return _.options;
					}(_p28));
			},
			items);
		var numItems = _elm_lang$core$List$length(items);
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Menu$defaultConfig, properties);
		var config = summary.config;
		var alignment = function () {
			var _p29 = config.alignment;
			switch (_p29.ctor) {
				case 'BottomLeft':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu--bottom-left');
				case 'BottomRight':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu--bottom-right');
				case 'TopLeft':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu--top-left');
				default:
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu--top-right');
			}
		}();
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'position', 'relative'),
				_1: properties
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$map,
					lift,
					A3(
						_MichaelCombs28$elm_mdl$Material_Options$styled,
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button'),
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-button'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--icon'),
									_1: {
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Options$when,
											_MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
												_MichaelCombs28$elm_mdl$Material_Menu$onKeyDown(
													_MichaelCombs28$elm_mdl$Material_Menu$Key(itemSummaries))),
											_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)),
										_1: {
											ctor: '::',
											_0: A2(
												_MichaelCombs28$elm_mdl$Material_Options$when,
												_MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
													A2(_MichaelCombs28$elm_mdl$Material_Menu$onClick, _MichaelCombs28$elm_mdl$Material_Menu_Geometry$decode, _MichaelCombs28$elm_mdl$Material_Menu$Open)),
												!_elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened)),
											_1: {
												ctor: '::',
												_0: A2(
													_MichaelCombs28$elm_mdl$Material_Options$when,
													_MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
														_elm_lang$html$Html_Events$onClick(_MichaelCombs28$elm_mdl$Material_Menu$Close)),
													_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Icon$view,
								config.icon,
								{
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('material-icons'),
									_1: {
										ctor: '::',
										_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'pointer-events', 'none'),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						})),
				_1: {
					ctor: '::',
					_0: A3(
						_MichaelCombs28$elm_mdl$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu__container'),
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Options$cs('is-upgraded'),
								_1: {
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Options$when,
										_MichaelCombs28$elm_mdl$Material_Options$cs('is-visible'),
										_elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened) || _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Closing)),
									_1: {
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Menu$withGeometry,
											model,
											_MichaelCombs28$elm_mdl$Material_Menu$containerGeometry(config.alignment)),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A3(
								_MichaelCombs28$elm_mdl$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu__outline'),
									_1: {
										ctor: '::',
										_0: alignment,
										_1: {
											ctor: '::',
											_0: A2(
												_MichaelCombs28$elm_mdl$Material_Menu$withGeometry,
												model,
												function (geometry) {
													return _MichaelCombs28$elm_mdl$Material_Options$many(
														{
															ctor: '::',
															_0: A2(
																_MichaelCombs28$elm_mdl$Material_Options$css,
																'width',
																_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.bounds.width)),
															_1: {
																ctor: '::',
																_0: A2(
																	_MichaelCombs28$elm_mdl$Material_Options$css,
																	'height',
																	_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.bounds.height)),
																_1: {ctor: '[]'}
															}
														});
												}),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A3(
									_MichaelCombs28$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$ul,
									{
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu'),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-menu'),
											_1: {
												ctor: '::',
												_0: A2(
													_MichaelCombs28$elm_mdl$Material_Options$when,
													_MichaelCombs28$elm_mdl$Material_Options$cs('is-animating'),
													_elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opening) || _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Closing)),
												_1: {
													ctor: '::',
													_0: A2(
														_MichaelCombs28$elm_mdl$Material_Menu$withGeometry,
														model,
														A2(_MichaelCombs28$elm_mdl$Material_Menu$clip, model, config)),
													_1: {
														ctor: '::',
														_0: alignment,
														_1: {ctor: '[]'}
													}
												}
											}
										}
									},
									function () {
										var _p30 = model.geometry;
										if (_p30.ctor === 'Just') {
											var _p31 = _p30._0;
											return A6(
												_elm_lang$core$List$map5,
												A3(_MichaelCombs28$elm_mdl$Material_Menu$view1, lift, config, model),
												_p31.offsetTops,
												_p31.offsetHeights,
												A2(_elm_lang$core$List$range, 0, numItems - 1),
												itemSummaries,
												items);
										} else {
											return A4(
												_elm_lang$core$List$map3,
												A5(_MichaelCombs28$elm_mdl$Material_Menu$view1, lift, config, model, 0, 0),
												A2(_elm_lang$core$List$range, 0, numItems - 1),
												itemSummaries,
												items);
										}
									}()),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Menu$view,
	_MichaelCombs28$elm_mdl$Material_Menu$update_,
	function (_) {
		return _.menu;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{menu: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Menu$defaultModel);

var _MichaelCombs28$elm_mdl$Material_Snackbar$enqueue = F2(
	function (contents, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				queue: A2(
					_elm_lang$core$List$append,
					model.queue,
					{
						ctor: '::',
						_0: contents,
						_1: {ctor: '[]'}
					})
			});
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$snackbar = F3(
	function (payload, message, label) {
		return {
			message: message,
			action: _elm_lang$core$Maybe$Just(label),
			payload: payload,
			timeout: 2750,
			fade: 250
		};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$toast = F2(
	function (payload, message) {
		return {message: message, action: _elm_lang$core$Maybe$Nothing, payload: payload, timeout: 2750, fade: 250};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$Contents = F5(
	function (a, b, c, d, e) {
		return {message: a, action: b, payload: c, timeout: d, fade: e};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$Model = F3(
	function (a, b, c) {
		return {queue: a, state: b, seq: c};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$Fading = function (a) {
	return {ctor: 'Fading', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Active = function (a) {
	return {ctor: 'Active', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Inert = {ctor: 'Inert'};
var _MichaelCombs28$elm_mdl$Material_Snackbar$model = {
	queue: {ctor: '[]'},
	state: _MichaelCombs28$elm_mdl$Material_Snackbar$Inert,
	seq: -1
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Clicked = {ctor: 'Clicked'};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Timeout = {ctor: 'Timeout'};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Move = F2(
	function (a, b) {
		return {ctor: 'Move', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$next = function (model) {
	return _elm_lang$core$Platform_Cmd$map(
		_MichaelCombs28$elm_mdl$Material_Snackbar$Move(model.seq));
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$view = function (model) {
	var isActive = function () {
		var _p0 = model.state;
		switch (_p0.ctor) {
			case 'Inert':
				return false;
			case 'Active':
				return true;
			default:
				return false;
		}
	}();
	var contents = function () {
		var _p1 = model.state;
		switch (_p1.ctor) {
			case 'Inert':
				return _elm_lang$core$Maybe$Nothing;
			case 'Active':
				return _elm_lang$core$Maybe$Just(_p1._0);
			default:
				return _elm_lang$core$Maybe$Just(_p1._0);
		}
	}();
	var action = A2(
		_elm_lang$core$Maybe$andThen,
		function (_) {
			return _.action;
		},
		contents);
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'mdl-js-snackbar', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-snackbar', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'mdl-snackbar--active', _1: isActive},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(_MichaelCombs28$elm_mdl$Material_Helpers$aria, 'hidden', !isActive),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('mdl-snackbar__text'),
					_1: {ctor: '[]'}
				},
				A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					A2(
						_elm_lang$core$Maybe$map,
						function (c) {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html$text(c.message),
								_1: {ctor: '[]'}
							};
						},
						contents))),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$button,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('mdl-snackbar__action'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$type_('button'),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Helpers$aria,
									'hidden',
									A2(
										_elm_lang$core$Maybe$withDefault,
										true,
										A2(
											_elm_lang$core$Maybe$map,
											_elm_lang$core$Basics$always(!isActive),
											action))),
								_1: A2(
									_elm_lang$core$Maybe$withDefault,
									{ctor: '[]'},
									A2(
										_elm_lang$core$Maybe$map,
										_elm_lang$core$Basics$always(
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(
													A2(_MichaelCombs28$elm_mdl$Material_Snackbar$Move, model.seq, _MichaelCombs28$elm_mdl$Material_Snackbar$Clicked)),
												_1: {ctor: '[]'}
											}),
										action))
							}
						}
					},
					A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						A2(
							_elm_lang$core$Maybe$map,
							function (action) {
								return {
									ctor: '::',
									_0: _elm_lang$html$Html$text(action),
									_1: {ctor: '[]'}
								};
							},
							action))),
				_1: {ctor: '[]'}
			}
		});
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Click = function (a) {
	return {ctor: 'Click', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$End = function (a) {
	return {ctor: 'End', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Begin = function (a) {
	return {ctor: 'Begin', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$tryDequeue = function (model) {
	var _p2 = {ctor: '_Tuple2', _0: model.state, _1: model.queue};
	if (((_p2.ctor === '_Tuple2') && (_p2._0.ctor === 'Inert')) && (_p2._1.ctor === '::')) {
		var _p3 = _p2._1._0;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					state: _MichaelCombs28$elm_mdl$Material_Snackbar$Active(_p3),
					queue: _p2._1._1,
					seq: model.seq + 1
				}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Platform_Cmd$map,
						_MichaelCombs28$elm_mdl$Material_Snackbar$Move(model.seq + 1),
						A2(_MichaelCombs28$elm_mdl$Material_Helpers$delay, _p3.timeout, _MichaelCombs28$elm_mdl$Material_Snackbar$Timeout)),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Helpers$cmd(
							_MichaelCombs28$elm_mdl$Material_Snackbar$Begin(_p3.payload)),
						_1: {ctor: '[]'}
					}
				})
		};
	} else {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	}
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$move = F2(
	function (transition, model) {
		var _p4 = {ctor: '_Tuple2', _0: model.state, _1: transition};
		_v3_4:
		do {
			if (_p4.ctor === '_Tuple2') {
				if (_p4._1.ctor === 'Clicked') {
					if (_p4._0.ctor === 'Active') {
						var _p5 = _p4._0._0;
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									state: _MichaelCombs28$elm_mdl$Material_Snackbar$Fading(_p5)
								}),
							_1: _elm_lang$core$Platform_Cmd$batch(
								{
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Snackbar$next,
										model,
										A2(_MichaelCombs28$elm_mdl$Material_Helpers$delay, _p5.fade, _MichaelCombs28$elm_mdl$Material_Snackbar$Timeout)),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Helpers$cmd(
											_MichaelCombs28$elm_mdl$Material_Snackbar$Click(_p5.payload)),
										_1: {ctor: '[]'}
									}
								})
						};
					} else {
						break _v3_4;
					}
				} else {
					switch (_p4._0.ctor) {
						case 'Inert':
							return _MichaelCombs28$elm_mdl$Material_Snackbar$tryDequeue(model);
						case 'Active':
							var _p6 = _p4._0._0;
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.update(
									model,
									{
										state: _MichaelCombs28$elm_mdl$Material_Snackbar$Fading(_p6)
									}),
								_1: _elm_lang$core$Platform_Cmd$batch(
									{
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Snackbar$next,
											model,
											A2(_MichaelCombs28$elm_mdl$Material_Helpers$delay, _p6.fade, _MichaelCombs28$elm_mdl$Material_Snackbar$Timeout)),
										_1: {ctor: '[]'}
									})
							};
						default:
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.update(
									model,
									{state: _MichaelCombs28$elm_mdl$Material_Snackbar$Inert}),
								_1: _elm_lang$core$Platform_Cmd$batch(
									{
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Snackbar$next,
											model,
											_MichaelCombs28$elm_mdl$Material_Helpers$cmd(_MichaelCombs28$elm_mdl$Material_Snackbar$Timeout)),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Helpers$cmd(
												_MichaelCombs28$elm_mdl$Material_Snackbar$End(_p4._0._0.payload)),
											_1: {ctor: '[]'}
										}
									})
							};
					}
				}
			} else {
				break _v3_4;
			}
		} while(false);
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$update = F2(
	function (action, model) {
		var _p7 = action;
		if (_p7.ctor === 'Move') {
			return _elm_lang$core$Native_Utils.eq(_p7._0, model.seq) ? A2(_MichaelCombs28$elm_mdl$Material_Snackbar$move, _p7._1, model) : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$add = F2(
	function (contents, model) {
		return _MichaelCombs28$elm_mdl$Material_Snackbar$tryDequeue(
			A2(_MichaelCombs28$elm_mdl$Material_Snackbar$enqueue, contents, model));
	});

var _elm_lang$html$Html_Keyed$node = _elm_lang$virtual_dom$VirtualDom$keyedNode;
var _elm_lang$html$Html_Keyed$ol = _elm_lang$html$Html_Keyed$node('ol');
var _elm_lang$html$Html_Keyed$ul = _elm_lang$html$Html_Keyed$node('ul');

var _elm_lang$window$Native_Window = function()
{

var size = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)	{
	callback(_elm_lang$core$Native_Scheduler.succeed({
		width: window.innerWidth,
		height: window.innerHeight
	}));
});

return {
	size: size
};

}();
var _elm_lang$window$Window_ops = _elm_lang$window$Window_ops || {};
_elm_lang$window$Window_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$window$Window$onSelfMsg = F3(
	function (router, dimensions, state) {
		var _p1 = state;
		if (_p1.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (_p2) {
				var _p3 = _p2;
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p3._0(dimensions));
			};
			return A2(
				_elm_lang$window$Window_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p1._0.subs)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$window$Window$init = _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
var _elm_lang$window$Window$size = _elm_lang$window$Native_Window.size;
var _elm_lang$window$Window$width = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.width;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$height = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.height;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$onEffects = F3(
	function (router, newSubs, oldState) {
		var _p4 = {ctor: '_Tuple2', _0: oldState, _1: newSubs};
		if (_p4._0.ctor === 'Nothing') {
			if (_p4._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return _elm_lang$core$Task$succeed(
							_elm_lang$core$Maybe$Just(
								{subs: newSubs, pid: pid}));
					},
					_elm_lang$core$Process$spawn(
						A3(
							_elm_lang$dom$Dom_LowLevel$onWindow,
							'resize',
							_elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple0'}),
							function (_p5) {
								return A2(
									_elm_lang$core$Task$andThen,
									_elm_lang$core$Platform$sendToSelf(router),
									_elm_lang$window$Window$size);
							})));
			}
		} else {
			if (_p4._1.ctor === '[]') {
				return A2(
					_elm_lang$window$Window_ops['&>'],
					_elm_lang$core$Process$kill(_p4._0._0.pid),
					_elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing));
			} else {
				return _elm_lang$core$Task$succeed(
					_elm_lang$core$Maybe$Just(
						{subs: newSubs, pid: _p4._0._0.pid}));
			}
		}
	});
var _elm_lang$window$Window$subscription = _elm_lang$core$Native_Platform.leaf('Window');
var _elm_lang$window$Window$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _elm_lang$window$Window$MySub = function (a) {
	return {ctor: 'MySub', _0: a};
};
var _elm_lang$window$Window$resizes = function (tagger) {
	return _elm_lang$window$Window$subscription(
		_elm_lang$window$Window$MySub(tagger));
};
var _elm_lang$window$Window$subMap = F2(
	function (func, _p6) {
		var _p7 = _p6;
		return _elm_lang$window$Window$MySub(
			function (_p8) {
				return func(
					_p7._0(_p8));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Window'] = {pkg: 'elm-lang/window', init: _elm_lang$window$Window$init, onEffects: _elm_lang$window$Window$onEffects, onSelfMsg: _elm_lang$window$Window$onSelfMsg, tag: 'sub', subMap: _elm_lang$window$Window$subMap};

var _MichaelCombs28$elm_mdl$Material_Layout$drawerView = F3(
	function (lift, isVisible, elems) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__drawer', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-visible', _1: isVisible},
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html_Attributes$attribute,
						'aria-hidden',
						isVisible ? 'false' : 'true'),
					_1: {ctor: '[]'}
				}
			},
			elems);
	});
var _MichaelCombs28$elm_mdl$Material_Layout$onKeypressFilterSpaceAndEnter = A2(_elm_lang$html$Html_Attributes$attribute, 'onkeypress', '\n  (function (evt) {\n     if (evt && evt.type === \"keydown\" && (evt.keyCode === 32 || evt.keyCode === 13)) {\n       evt.preventDefault();\n     }\n   })(window.event);\n  ');
var _MichaelCombs28$elm_mdl$Material_Layout$toList = function (x) {
	var _p0 = x;
	if (_p0.ctor === 'Nothing') {
		return {ctor: '[]'};
	} else {
		return {
			ctor: '::',
			_0: _p0._0,
			_1: {ctor: '[]'}
		};
	}
};
var _MichaelCombs28$elm_mdl$Material_Layout$isWaterfall = function (mode) {
	var _p1 = mode;
	if (_p1.ctor === 'Waterfall') {
		return true;
	} else {
		return false;
	}
};
var _MichaelCombs28$elm_mdl$Material_Layout$row = function (styles) {
	return _MichaelCombs28$elm_mdl$Material_Options$div(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header-row'),
			_1: styles
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$link = F2(
	function (styles, contents) {
		return A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$a,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-navigation__link'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
						A2(_elm_lang$html$Html_Attributes$attribute, 'tabindex', '1')),
					_1: styles
				}
			},
			contents);
	});
var _MichaelCombs28$elm_mdl$Material_Layout$href = function (_p2) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
		_elm_lang$html$Html_Attributes$href(_p2));
};
var _MichaelCombs28$elm_mdl$Material_Layout$onClick = function (_p3) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
		_elm_lang$html$Html_Events$onClick(_p3));
};
var _MichaelCombs28$elm_mdl$Material_Layout$navigation = F2(
	function (styles, contents) {
		return A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$nav,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-navigation'),
				_1: styles
			},
			contents);
	});
var _MichaelCombs28$elm_mdl$Material_Layout$title = function (styles) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__title'),
			_1: styles
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$spacer = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('mdl-layout-spacer'),
		_1: {ctor: '[]'}
	},
	{ctor: '[]'});
var _MichaelCombs28$elm_mdl$Material_Layout$onSelectTab = function (f) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onSelectTab: _elm_lang$core$Maybe$Just(
						function (_p4) {
							return _elm_lang$html$Html_Events$onClick(
								f(_p4));
						})
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$moreTabs = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{moreTabs: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$selectedTab = function (k) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{selectedTab: k});
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$transparentHeader = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{transparentHeader: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$rippleTabs = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{rippleTabs: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$fixedTabs = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedTabs: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$fixedDrawer = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedDrawer: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$fixedHeader = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedHeader: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$setTabsWidth_ = F2(
	function (width, model) {
		var x = model.tabScrollState;
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				tabScrollState: _elm_lang$core$Native_Utils.update(
					x,
					{
						width: _elm_lang$core$Maybe$Just(width)
					})
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$setTabsWidth = F2(
	function (w, container) {
		return _elm_lang$core$Native_Utils.update(
			container,
			{
				layout: A2(_MichaelCombs28$elm_mdl$Material_Layout$setTabsWidth_, w, container.layout)
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$defaultTabScrollState = {canScrollRight: true, canScrollLeft: false, width: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Layout$defaultModel = {ripples: _elm_lang$core$Dict$empty, isSmallScreen: false, isCompact: false, isAnimating: false, isScrolled: false, isDrawerOpen: false, tabScrollState: _MichaelCombs28$elm_mdl$Material_Layout$defaultTabScrollState};
var _MichaelCombs28$elm_mdl$Material_Layout$TabScrollState = F3(
	function (a, b, c) {
		return {canScrollLeft: a, canScrollRight: b, width: c};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {ripples: a, isSmallScreen: b, isCompact: c, isAnimating: d, isScrolled: e, isDrawerOpen: f, tabScrollState: g};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Config = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {fixedHeader: a, fixedDrawer: b, fixedTabs: c, rippleTabs: d, mode: e, selectedTab: f, onSelectTab: g, transparentHeader: h, moreTabs: i};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Contents = F4(
	function (a, b, c, d) {
		return {header: a, drawer: b, tabs: c, main: d};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Ripple = F2(
	function (a, b) {
		return {ctor: 'Ripple', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$NOP = {ctor: 'NOP'};
var _MichaelCombs28$elm_mdl$Material_Layout$TransitionEnd = {ctor: 'TransitionEnd'};
var _MichaelCombs28$elm_mdl$Material_Layout$TransitionHeader = function (a) {
	return {ctor: 'TransitionHeader', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Layout$update_ = F3(
	function (f, action, model) {
		update_:
		while (true) {
			var _p5 = action;
			switch (_p5.ctor) {
				case 'NOP':
					return _elm_lang$core$Maybe$Nothing;
				case 'Resize':
					var _p6 = _p5._0;
					var tabScrollState = A2(
						_elm_lang$core$Maybe$withDefault,
						model.tabScrollState,
						A2(
							_elm_lang$core$Maybe$map,
							function (tabsWidth) {
								var tabScrollState = model.tabScrollState;
								return _elm_lang$core$Native_Utils.update(
									tabScrollState,
									{
										canScrollRight: _elm_lang$core$Native_Utils.cmp(tabsWidth + (2 * 56), _p6) > 0
									});
							},
							model.tabScrollState.width));
					var isSmall = _elm_lang$core$Native_Utils.cmp(1024, _p6) > 0;
					return (_elm_lang$core$Native_Utils.eq(isSmall, model.isSmallScreen) && _elm_lang$core$Native_Utils.eq(tabScrollState.canScrollRight, model.tabScrollState.canScrollRight)) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
						_MichaelCombs28$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isSmallScreen: isSmall, isDrawerOpen: (!isSmall) && model.isDrawerOpen, tabScrollState: tabScrollState})));
				case 'ToggleDrawer':
					return _elm_lang$core$Maybe$Just(
						_MichaelCombs28$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isDrawerOpen: !model.isDrawerOpen})));
				case 'Ripple':
					var _p8 = _p5._0;
					return _elm_lang$core$Maybe$Just(
						A2(
							_MichaelCombs28$elm_mdl$Material_Helpers$map2nd,
							_elm_lang$core$Platform_Cmd$map(
								function (_p7) {
									return f(
										A2(_MichaelCombs28$elm_mdl$Material_Layout$Ripple, _p8, _p7));
								}),
							A2(
								_MichaelCombs28$elm_mdl$Material_Helpers$map1st,
								function (ripple_) {
									return _elm_lang$core$Native_Utils.update(
										model,
										{
											ripples: A3(_elm_lang$core$Dict$insert, _p8, ripple_, model.ripples)
										});
								},
								A2(
									_MichaelCombs28$elm_mdl$Material_Ripple$update,
									_p5._1,
									A2(
										_elm_lang$core$Maybe$withDefault,
										_MichaelCombs28$elm_mdl$Material_Ripple$model,
										A2(_elm_lang$core$Dict$get, _p8, model.ripples))))));
				case 'ScrollTab':
					var _p9 = _p5._0;
					return (!_elm_lang$core$Native_Utils.eq(model.tabScrollState, _p9)) ? _elm_lang$core$Maybe$Just(
						_MichaelCombs28$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{tabScrollState: _p9}))) : _elm_lang$core$Maybe$Nothing;
				case 'ScrollPane':
					var isScrolled = _elm_lang$core$Native_Utils.cmp(0.0, _p5._1) < 0;
					if (!_elm_lang$core$Native_Utils.eq(isScrolled, model.isScrolled)) {
						var _v3 = f,
							_v4 = _MichaelCombs28$elm_mdl$Material_Layout$TransitionHeader(
							{toCompact: isScrolled, fixedHeader: _p5._0}),
							_v5 = _elm_lang$core$Native_Utils.update(
							model,
							{isScrolled: isScrolled});
						f = _v3;
						action = _v4;
						model = _v5;
						continue update_;
					} else {
						return _elm_lang$core$Maybe$Nothing;
					}
				case 'TransitionHeader':
					return (!model.isAnimating) ? _elm_lang$core$Maybe$Just(
						{
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{isCompact: _p5._0.toCompact, isAnimating: (!model.isSmallScreen) || _p5._0.fixedHeader}),
							_1: _elm_lang$core$Platform_Cmd$none
						}) : _elm_lang$core$Maybe$Nothing;
				default:
					return _elm_lang$core$Maybe$Just(
						_MichaelCombs28$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isAnimating: false})));
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Layout$update = F2(
	function (msg, model) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none},
			A3(_MichaelCombs28$elm_mdl$Material_Layout$update_, _elm_lang$core$Basics$identity, msg, model));
	});
var _MichaelCombs28$elm_mdl$Material_Layout$pack = function (fwd) {
	return A4(
		_MichaelCombs28$elm_parts$Parts$pack1,
		F3(
			function (x, y, z) {
				return _MichaelCombs28$elm_mdl$Material_Helpers$partsUpdatePort(
					A3(_MichaelCombs28$elm_mdl$Material_Layout$update_, x, y, z));
			}),
		function (_) {
			return _.layout;
		},
		F2(
			function (x, c) {
				return _elm_lang$core$Native_Utils.update(
					c,
					{layout: x});
			}),
		fwd);
};
var _MichaelCombs28$elm_mdl$Material_Layout$ScrollPane = F2(
	function (a, b) {
		return {ctor: 'ScrollPane', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$ScrollTab = function (a) {
	return {ctor: 'ScrollTab', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Layout$Resize = function (a) {
	return {ctor: 'Resize', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Layout$init = function () {
	var result_ = function (result) {
		var _p10 = result;
		if (_p10.ctor === 'Ok') {
			return _MichaelCombs28$elm_mdl$Material_Layout$Resize(_p10._0);
		} else {
			return _MichaelCombs28$elm_mdl$Material_Layout$Resize(
				A2(_elm_lang$core$Debug$log, 'Can\'t get initial window dimensions. Guessing ', 1025));
		}
	};
	var measureScreenSize = A2(_elm_lang$core$Task$attempt, result_, _elm_lang$window$Window$width);
	return {ctor: '_Tuple2', _0: _MichaelCombs28$elm_mdl$Material_Layout$defaultModel, _1: measureScreenSize};
}();
var _MichaelCombs28$elm_mdl$Material_Layout$sub0 = function (lift) {
	return A2(
		_elm_lang$core$Platform_Cmd$map,
		_MichaelCombs28$elm_mdl$Material_Layout$pack(lift),
		_elm_lang$core$Tuple$second(_MichaelCombs28$elm_mdl$Material_Layout$init));
};
var _MichaelCombs28$elm_mdl$Material_Layout$subscriptions = function (model) {
	return _elm_lang$window$Window$resizes(
		function (_p11) {
			return _MichaelCombs28$elm_mdl$Material_Layout$Resize(
				function (_) {
					return _.width;
				}(_p11));
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$subs = function (lift) {
	return function (_p12) {
		return A2(
			_elm_lang$core$Platform_Sub$map,
			_MichaelCombs28$elm_mdl$Material_Layout$pack(lift),
			_MichaelCombs28$elm_mdl$Material_Layout$subscriptions(
				function (_) {
					return _.layout;
				}(_p12)));
	};
};
var _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer = {ctor: 'ToggleDrawer'};
var _MichaelCombs28$elm_mdl$Material_Layout$drawerButton = F2(
	function (lift, isVisible) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'mdl-layout__drawer-button', _1: true},
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html_Attributes$attribute,
								'aria-expanded',
								isVisible ? 'true' : 'false'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$tabindex(1),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(
										lift(_MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer)),
									_1: {
										ctor: '::',
										_0: A3(
											_elm_lang$html$Html_Events$onWithOptions,
											'keydown',
											{stopPropagation: false, preventDefault: false},
											A2(
												_elm_lang$core$Json_Decode$map,
												function (_p13) {
													return lift(
														function (key) {
															var _p14 = key;
															switch (_p14) {
																case 32:
																	return _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer;
																case 13:
																	return _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer;
																default:
																	return _MichaelCombs28$elm_mdl$Material_Layout$NOP;
															}
														}(_p13));
												},
												_elm_lang$html$Html_Events$keyCode)),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Icon$i('menu'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$obfuscator = F2(
	function (lift, isVisible) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__obfuscator', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-visible', _1: isVisible},
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(
						lift(_MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer)),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$toggleDrawer = function (lift) {
	return A2(_MichaelCombs28$elm_mdl$Material_Layout$pack, lift, _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer);
};
var _MichaelCombs28$elm_mdl$Material_Layout$LinkProp = {ctor: 'LinkProp'};
var _MichaelCombs28$elm_mdl$Material_Layout$Waterfall = function (a) {
	return {ctor: 'Waterfall', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Layout$waterfall = function (b) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					mode: _MichaelCombs28$elm_mdl$Material_Layout$Waterfall(b)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$Scrolling = {ctor: 'Scrolling'};
var _MichaelCombs28$elm_mdl$Material_Layout$scrolling = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{mode: _MichaelCombs28$elm_mdl$Material_Layout$Scrolling});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Seamed = {ctor: 'Seamed'};
var _MichaelCombs28$elm_mdl$Material_Layout$seamed = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{mode: _MichaelCombs28$elm_mdl$Material_Layout$Seamed});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Standard = {ctor: 'Standard'};
var _MichaelCombs28$elm_mdl$Material_Layout$defaultConfig = {fixedHeader: false, fixedDrawer: false, fixedTabs: false, rippleTabs: true, mode: _MichaelCombs28$elm_mdl$Material_Layout$Standard, onSelectTab: _elm_lang$core$Maybe$Nothing, selectedTab: -1, moreTabs: false, transparentHeader: false};
var _MichaelCombs28$elm_mdl$Material_Layout$headerView = F4(
	function (lift, config, model, _p15) {
		var _p16 = _p15;
		var mode = function () {
			var _p17 = config.mode;
			switch (_p17.ctor) {
				case 'Standard':
					return _MichaelCombs28$elm_mdl$Material_Options$nop;
				case 'Scrolling':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--scroll');
				case 'Seamed':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--seamed');
				default:
					if (_p17._0 === true) {
						return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--waterfall mdl-layout__header--waterfall-hide-top');
					} else {
						return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--waterfall');
					}
			}
		}();
		return A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$header,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header'),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$when,
						_MichaelCombs28$elm_mdl$Material_Options$cs('is-casting-shadow'),
						_elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Standard) || (_MichaelCombs28$elm_mdl$Material_Layout$isWaterfall(config.mode) && model.isCompact)),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('is-animating'),
							model.isAnimating),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								_MichaelCombs28$elm_mdl$Material_Options$cs('is-compact'),
								model.isCompact),
							_1: {
								ctor: '::',
								_0: mode,
								_1: {
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Options$when,
										_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--transparent'),
										config.transparentHeader),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
											_elm_lang$html$Html_Events$onClick(
												lift(
													_MichaelCombs28$elm_mdl$Material_Layout$TransitionHeader(
														{toCompact: false, fixedHeader: config.fixedHeader})))),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
												A2(
													_elm_lang$html$Html_Events$on,
													'transitionend',
													_elm_lang$core$Json_Decode$succeed(
														lift(_MichaelCombs28$elm_mdl$Material_Layout$TransitionEnd)))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			},
			A2(
				_elm_lang$core$List$concatMap,
				function (x) {
					return x;
				},
				{
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Layout$toList(_p16._0),
					_1: {
						ctor: '::',
						_0: _p16._1,
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Layout$toList(_p16._2),
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Right = {ctor: 'Right'};
var _MichaelCombs28$elm_mdl$Material_Layout$Left = {ctor: 'Left'};
var _MichaelCombs28$elm_mdl$Material_Layout$tabsView = F4(
	function (lift, config, model, _p18) {
		var _p19 = _p18;
		var _p22 = _p19._1;
		var chevron = F2(
			function (direction, offset) {
				var dir = function () {
					var _p20 = direction;
					if (_p20.ctor === 'Left') {
						return 'left';
					} else {
						return 'right';
					}
				}();
				return A3(
					_MichaelCombs28$elm_mdl$Material_Options$styled,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__tab-bar-button'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs(
								A2(
									_elm_lang$core$Basics_ops['++'],
									'mdl-layout__tab-bar-',
									A2(_elm_lang$core$Basics_ops['++'], dir, '-button'))),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Options$when,
									_MichaelCombs28$elm_mdl$Material_Options$cs('is-active'),
									(_elm_lang$core$Native_Utils.eq(direction, _MichaelCombs28$elm_mdl$Material_Layout$Left) && model.tabScrollState.canScrollLeft) || (_elm_lang$core$Native_Utils.eq(direction, _MichaelCombs28$elm_mdl$Material_Layout$Right) && model.tabScrollState.canScrollRight)),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$many(_p22),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Icon$view,
							A2(_elm_lang$core$Basics_ops['++'], 'chevron_', dir),
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Icon$size24,
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
										A2(
											_elm_lang$html$Html_Attributes$attribute,
											'onclick',
											A2(
												_elm_lang$core$Basics_ops['++'],
												'document.getElementsByClassName(\'mdl-layout__tab-bar\')[0].scrollLeft += ',
												_elm_lang$core$Basics$toString(offset)))),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					});
			});
		return A2(
			_MichaelCombs28$elm_mdl$Material_Options$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__tab-bar-container'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(chevron, _MichaelCombs28$elm_mdl$Material_Layout$Left, -100),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$div,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__tab-bar'),
							_1: {
								ctor: '::',
								_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'position', 'relative'),
								_1: {
									ctor: '::',
									_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'scroll-behavior', 'smooth'),
									_1: {
										ctor: '::',
										_0: config.rippleTabs ? _MichaelCombs28$elm_mdl$Material_Options$many(
											{
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
												_1: {
													ctor: '::',
													_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mds-js-ripple-effect--ignore-events'),
													_1: {ctor: '[]'}
												}
											}) : _MichaelCombs28$elm_mdl$Material_Options$nop,
										_1: {
											ctor: '::',
											_0: _elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Standard) ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-casting-shadow') : _MichaelCombs28$elm_mdl$Material_Options$nop,
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Options$many(_p22),
												_1: {
													ctor: '::',
													_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
														A2(
															_elm_lang$html$Html_Events$on,
															'scroll',
															_MichaelCombs28$elm_dom$DOM$target(
																A4(
																	_elm_lang$core$Json_Decode$map3,
																	F3(
																		function (scrollWidth, clientWidth, scrollLeft) {
																			return lift(
																				_MichaelCombs28$elm_mdl$Material_Layout$ScrollTab(
																					{
																						canScrollLeft: _elm_lang$core$Native_Utils.cmp(scrollLeft, 0) > 0,
																						canScrollRight: _elm_lang$core$Native_Utils.cmp(scrollWidth - clientWidth, scrollLeft + 1) > 0,
																						width: _elm_lang$core$Maybe$Just(scrollWidth)
																					}));
																		}),
																	A2(_elm_lang$core$Json_Decode$field, 'scrollWidth', _elm_lang$core$Json_Decode$float),
																	A2(_elm_lang$core$Json_Decode$field, 'clientWidth', _elm_lang$core$Json_Decode$float),
																	A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float))))),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						},
						A2(
							_elm_lang$core$List$indexedMap,
							F2(
								function (tabIndex, tab) {
									return A3(
										_MichaelCombs28$elm_mdl$Material_Helpers$filter,
										_elm_lang$html$Html$a,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$classList(
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'mdl-layout__tab', _1: true},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: 'is-active',
															_1: _elm_lang$core$Native_Utils.eq(tabIndex, config.selectedTab)
														},
														_1: {ctor: '[]'}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$core$Maybe$withDefault,
													_MichaelCombs28$elm_mdl$Material_Helpers$noAttr,
													A2(
														_elm_lang$core$Maybe$map,
														F2(
															function (x, y) {
																return y(x);
															})(tabIndex),
														config.onSelectTab)),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$core$Maybe$Just(tab),
											_1: {
												ctor: '::',
												_0: config.rippleTabs ? _elm_lang$core$Maybe$Just(
													A2(
														_elm_lang$html$Html$map,
														function (_p21) {
															return lift(
																A2(_MichaelCombs28$elm_mdl$Material_Layout$Ripple, tabIndex, _p21));
														},
														A2(
															_MichaelCombs28$elm_mdl$Material_Ripple$view,
															{
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$class('mdl-layout__tab-ripple-container'),
																_1: {ctor: '[]'}
															},
															A2(
																_elm_lang$core$Maybe$withDefault,
																_MichaelCombs28$elm_mdl$Material_Ripple$model,
																A2(_elm_lang$core$Dict$get, tabIndex, model.ripples))))) : _elm_lang$core$Maybe$Nothing,
												_1: {ctor: '[]'}
											}
										});
								}),
							_p19._0)),
					_1: {
						ctor: '::',
						_0: A2(chevron, _MichaelCombs28$elm_mdl$Material_Layout$Right, 100),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$view = F4(
	function (lift, model, options, _p23) {
		var _p24 = _p23;
		var _p32 = _p24.tabs;
		var _p31 = _p24.header;
		var _p30 = _p24.drawer;
		var hasDrawer = !_elm_lang$core$Native_Utils.eq(
			_p30,
			{ctor: '[]'});
		var hasTabs = !_elm_lang$core$List$isEmpty(
			_elm_lang$core$Tuple$first(_p32));
		var hasHeader = hasTabs || (!_elm_lang$core$List$isEmpty(_p31));
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Layout$defaultConfig, options);
		var config = summary.config;
		var drawerIsFixed = config.fixedDrawer && (!model.isSmallScreen);
		var drawerIsVisible = model.isDrawerOpen && (!drawerIsFixed);
		var _p25 = function () {
			var _p26 = {ctor: '_Tuple3', _0: _p30, _1: _p31, _2: config.fixedHeader};
			if ((_p26.ctor === '_Tuple3') && (_p26._0.ctor === '::')) {
				if ((_p26._1.ctor === '::') && (_p26._2 === true)) {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Nothing,
						_1: _elm_lang$core$Maybe$Just(
							A2(_MichaelCombs28$elm_mdl$Material_Layout$drawerButton, lift, drawerIsVisible))
					};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							A2(_MichaelCombs28$elm_mdl$Material_Layout$drawerButton, lift, drawerIsVisible)),
						_1: _elm_lang$core$Maybe$Nothing
					};
				}
			} else {
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Maybe$Nothing};
			}
		}();
		var contentDrawerButton = _p25._0;
		var headerDrawerButton = _p25._1;
		var tabsElems = (!hasTabs) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A4(_MichaelCombs28$elm_mdl$Material_Layout$tabsView, lift, config, model, _p32));
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__container', _1: true},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'has-scrolling-header',
								_1: _elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Scrolling)
							},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(
					_MichaelCombs28$elm_mdl$Material_Helpers$filter,
					_elm_lang$html$Html_Keyed$node('div'),
					A2(
						_elm_lang$core$List$filterMap,
						_elm_lang$core$Basics$identity,
						{
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								_elm_lang$html$Html_Attributes$classList(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'mdl-layout ', _1: true},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'is-upgraded', _1: true},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'is-small-screen', _1: model.isSmallScreen},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'has-drawer', _1: hasDrawer},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'has-tabs', _1: hasTabs},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'mdl-js-layout', _1: true},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-drawer', _1: config.fixedDrawer && hasDrawer},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-header', _1: config.fixedHeader && hasHeader},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-tabs', _1: config.fixedTabs && hasTabs},
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									})),
							_1: {
								ctor: '::',
								_0: drawerIsVisible ? _elm_lang$core$Maybe$Just(
									A2(
										_elm_lang$html$Html_Events$on,
										'keydown',
										A2(
											_elm_lang$core$Json_Decode$map,
											function (_p27) {
												return lift(
													function (key) {
														return _elm_lang$core$Native_Utils.eq(key, 27) ? _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer : _MichaelCombs28$elm_mdl$Material_Layout$NOP;
													}(_p27));
											},
											_elm_lang$html$Html_Events$keyCode))) : _elm_lang$core$Maybe$Nothing,
								_1: {ctor: '[]'}
							}
						}),
					{
						ctor: '::',
						_0: hasHeader ? _elm_lang$core$Maybe$Just(
							A2(
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								'elm-mdl-header',
								A4(
									_MichaelCombs28$elm_mdl$Material_Layout$headerView,
									lift,
									config,
									model,
									{ctor: '_Tuple3', _0: headerDrawerButton, _1: _p31, _2: tabsElems}))) : _elm_lang$core$Maybe$Nothing,
						_1: {
							ctor: '::',
							_0: (!hasDrawer) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
								{
									ctor: '_Tuple2',
									_0: 'elm-mdl-drawer',
									_1: A3(_MichaelCombs28$elm_mdl$Material_Layout$drawerView, lift, drawerIsVisible, _p30)
								}),
							_1: {
								ctor: '::',
								_0: (!hasDrawer) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
									{
										ctor: '_Tuple2',
										_0: 'elm-mdl-obfuscator',
										_1: A2(_MichaelCombs28$elm_mdl$Material_Layout$obfuscator, lift, drawerIsVisible)
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Maybe$map,
										F2(
											function (v0, v1) {
												return {ctor: '_Tuple2', _0: v0, _1: v1};
											})('elm-drawer-button'),
										contentDrawerButton),
									_1: {
										ctor: '::',
										_0: _elm_lang$core$Maybe$Just(
											A2(
												F2(
													function (v0, v1) {
														return {ctor: '_Tuple2', _0: v0, _1: v1};
													}),
												_elm_lang$core$Basics$toString(config.selectedTab),
												A3(
													_MichaelCombs28$elm_mdl$Material_Options$styled,
													_elm_lang$html$Html$main_,
													{
														ctor: '::',
														_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__content'),
														_1: {
															ctor: '::',
															_0: A2(
																_MichaelCombs28$elm_mdl$Material_Options$when,
																A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'overflow-y', 'visible'),
																_elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader),
															_1: {
																ctor: '::',
																_0: A2(
																	_MichaelCombs28$elm_mdl$Material_Options$when,
																	A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'overflow-x', 'visible'),
																	_elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_MichaelCombs28$elm_mdl$Material_Options$when,
																		A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'overflow', 'visible'),
																		_elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_MichaelCombs28$elm_mdl$Material_Options$when,
																			function (_p28) {
																				return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
																					A2(_elm_lang$html$Html_Events$on, 'scroll', _p28));
																			}(
																				A2(
																					_elm_lang$core$Json_Decode$map,
																					function (_p29) {
																						return lift(
																							A2(_MichaelCombs28$elm_mdl$Material_Layout$ScrollPane, config.fixedHeader, _p29));
																					},
																					_MichaelCombs28$elm_dom$DOM$target(_MichaelCombs28$elm_dom$DOM$scrollTop))),
																			_MichaelCombs28$elm_mdl$Material_Layout$isWaterfall(config.mode)),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													},
													_p24.main))),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$render = A4(
	_MichaelCombs28$elm_parts$Parts$create1,
	_MichaelCombs28$elm_mdl$Material_Layout$view,
	F3(
		function (x, y, z) {
			return _MichaelCombs28$elm_mdl$Material_Helpers$partsUpdatePort(
				A3(_MichaelCombs28$elm_mdl$Material_Layout$update_, x, y, z));
		}),
	function (_) {
		return _.layout;
	},
	F2(
		function (x, c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{layout: x});
		}));

var _MichaelCombs28$elm_mdl$Material_Toggles$group = function (s) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					group: _elm_lang$core$Maybe$Just(
						_elm_lang$html$Html_Attributes$name(s))
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Toggles$value = function (b) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{value: b});
		});
};
var _MichaelCombs28$elm_mdl$Material_Toggles$disabled = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{isDisabled: true});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$ripple = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$onClick = function (x) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					onClick: _elm_lang$core$Maybe$Just(
						A2(
							_elm_lang$html$Html_Events$on,
							'change',
							_elm_lang$core$Json_Decode$succeed(x)))
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Toggles$defaultConfig = {
	isDisabled: false,
	value: false,
	ripple: false,
	group: _elm_lang$core$Maybe$Nothing,
	onClick: _elm_lang$core$Maybe$Nothing,
	inner: {ctor: '[]'}
};
var _MichaelCombs28$elm_mdl$Material_Toggles$defaultModel = {ripple: _MichaelCombs28$elm_mdl$Material_Ripple$model, isFocused: false};
var _MichaelCombs28$elm_mdl$Material_Toggles$Model = F2(
	function (a, b) {
		return {ripple: a, isFocused: b};
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$Config = F6(
	function (a, b, c, d, e, f) {
		return {isDisabled: a, value: b, ripple: c, group: d, onClick: e, inner: f};
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Toggles$Ripple = function (a) {
	return {ctor: 'Ripple', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Toggles$update = F2(
	function (action, model) {
		var _p0 = action;
		if (_p0.ctor === 'Ripple') {
			return A2(
				_MichaelCombs28$elm_mdl$Material_Helpers$map2nd,
				_elm_lang$core$Platform_Cmd$map(_MichaelCombs28$elm_mdl$Material_Toggles$Ripple),
				A2(
					_MichaelCombs28$elm_mdl$Material_Helpers$map1st,
					function (r) {
						return _elm_lang$core$Native_Utils.update(
							model,
							{ripple: r});
					},
					A2(_MichaelCombs28$elm_mdl$Material_Ripple$update, _p0._0, model.ripple)));
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isFocused: _p0._0}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$render = function (view) {
	return A5(
		_MichaelCombs28$elm_parts$Parts$create,
		view,
		_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Toggles$update),
		function (_) {
			return _.toggles;
		},
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.update(
					y,
					{toggles: x});
			}),
		_MichaelCombs28$elm_mdl$Material_Toggles$defaultModel);
};
var _MichaelCombs28$elm_mdl$Material_Toggles$top = F5(
	function (lift, group, model, summary, elems) {
		var cfg = summary.config;
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs(
					A2(_elm_lang$core$Basics_ops['++'], 'mdl-', group)),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$cs(
						A2(_elm_lang$core$Basics_ops['++'], 'mdl-js-', group)),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
							cfg.ripple),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect--ignore-events'),
								cfg.ripple),
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Options$cs('is-upgraded'),
								_1: {
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Options$when,
										_MichaelCombs28$elm_mdl$Material_Options$cs('is-checked'),
										cfg.value),
									_1: {
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Options$when,
											_MichaelCombs28$elm_mdl$Material_Options$cs('is-focused'),
											model.isFocused),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Helpers$blurOn('mouseup'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onFocus(
						lift(
							_MichaelCombs28$elm_mdl$Material_Toggles$SetFocus(true))),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onBlur(
							lift(
								_MichaelCombs28$elm_mdl$Material_Toggles$SetFocus(false))),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$core$Maybe$withDefault, _MichaelCombs28$elm_mdl$Material_Helpers$noAttr, cfg.onClick),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: elems,
					_1: {
						ctor: '::',
						_0: cfg.ripple ? {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								function (_p1) {
									return lift(
										_MichaelCombs28$elm_mdl$Material_Toggles$Ripple(_p1));
								},
								A2(
									_MichaelCombs28$elm_mdl$Material_Ripple$view,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('mdl-switch__ripple-container mdl-js-ripple-effect mdl-ripple--center'),
										_1: {ctor: '[]'}
									},
									model.ripple)),
							_1: {ctor: '[]'}
						} : {ctor: '[]'},
						_1: {ctor: '[]'}
					}
				}));
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$viewCheckbox = F4(
	function (lift, model, config, elems) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Toggles$defaultConfig, config);
		var cfg = summary.config;
		return A5(
			_MichaelCombs28$elm_mdl$Material_Toggles$top,
			lift,
			'checkbox',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_MichaelCombs28$elm_mdl$Material_Options$styled_,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-checkbox__input'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$many(cfg.inner),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$disabled(cfg.isDisabled),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$checked(cfg.value),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$span,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__focus-helper'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__box-outline'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__tick-outline'),
											_1: {ctor: '[]'}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$checkbox = _MichaelCombs28$elm_mdl$Material_Toggles$render(_MichaelCombs28$elm_mdl$Material_Toggles$viewCheckbox);
var _MichaelCombs28$elm_mdl$Material_Toggles$viewSwitch = F4(
	function (lift, model, config, elems) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Toggles$defaultConfig, config);
		var cfg = summary.config;
		return A5(
			_MichaelCombs28$elm_mdl$Material_Toggles$top,
			lift,
			'switch',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_MichaelCombs28$elm_mdl$Material_Options$styled_,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-switch__input'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$many(cfg.inner),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$disabled(cfg.isDisabled),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$checked(cfg.value),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-switch__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-switch__track'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-switch__thumb'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('mdl-switch__focus-helper'),
											_1: {ctor: '[]'}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$switch = _MichaelCombs28$elm_mdl$Material_Toggles$render(_MichaelCombs28$elm_mdl$Material_Toggles$viewSwitch);
var _MichaelCombs28$elm_mdl$Material_Toggles$viewRadio = F4(
	function (lift, model, config, elems) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Toggles$defaultConfig, config);
		var cfg = summary.config;
		return A5(
			_MichaelCombs28$elm_mdl$Material_Toggles$top,
			lift,
			'radio',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_MichaelCombs28$elm_mdl$Material_Options$styled_,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-radio__button'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$many(cfg.inner),
							_1: {ctor: '[]'}
						}
					},
					A2(
						_elm_lang$core$List$filterMap,
						_elm_lang$core$Basics$identity,
						{
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								_elm_lang$html$Html_Attributes$type_('radio')),
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Maybe$Just(
									_elm_lang$html$Html_Attributes$disabled(cfg.isDisabled)),
								_1: {
									ctor: '::',
									_0: _elm_lang$core$Maybe$Just(
										_elm_lang$html$Html_Attributes$checked(cfg.value)),
									_1: {
										ctor: '::',
										_0: cfg.group,
										_1: {ctor: '[]'}
									}
								}
							}
						}),
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-radio__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$span,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-radio__outer-circle'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-radio__inner-circle'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$radio = _MichaelCombs28$elm_mdl$Material_Toggles$render(_MichaelCombs28$elm_mdl$Material_Toggles$viewRadio);

var _MichaelCombs28$elm_mdl$Material_Tooltip$set = F2(
	function (x, y) {
		return _elm_lang$core$Native_Utils.update(
			y,
			{tooltip: x});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$container = function (elem) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{container: elem});
		});
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$isTooltipClass = function (path) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function ($class) {
			return A2(_elm_lang$core$String$contains, 'mdl-tooltip', $class) ? _elm_lang$core$Json_Decode$succeed(true) : _elm_lang$core$Json_Decode$succeed(false);
		},
		A2(_elm_lang$core$Json_Decode$at, path, _MichaelCombs28$elm_dom$DOM$className));
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$sibling = function (d) {
	var valid = function (path) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (res) {
				return res ? A2(_elm_lang$core$Json_Decode$at, path, d) : _elm_lang$core$Json_Decode$fail('');
			},
			_MichaelCombs28$elm_mdl$Material_Tooltip$isTooltipClass(path));
	};
	var createPath = function (depth) {
		var parents = A2(_elm_lang$core$List$repeat, depth, 'parentElement');
		return A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: 'target',
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				parents,
				{
					ctor: '::',
					_0: 'nextSibling',
					_1: {ctor: '[]'}
				}));
	};
	var paths = A2(
		_elm_lang$core$List$map,
		createPath,
		A2(_elm_lang$core$List$range, 0, 4));
	return _elm_lang$core$Json_Decode$oneOf(
		A2(_elm_lang$core$List$map, valid, paths));
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$update = F2(
	function (action, model) {
		var _p0 = action;
		if (_p0.ctor === 'Enter') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isActive: true, domState: _p0._0}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isActive: false}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$calculatePos = F2(
	function (pos, domState) {
		var getValuesFor = F2(
			function (l, r) {
				return (_elm_lang$core$Native_Utils.cmp(l + r, 0) < 0) ? {ctor: '_Tuple2', _0: 0, _1: 0} : {ctor: '_Tuple2', _0: l, _1: r};
			});
		var offsetHeight = domState.offsetHeight;
		var marginTop = -1 * (offsetHeight / 2);
		var offsetWidth = domState.offsetWidth;
		var marginLeft = -1 * (offsetWidth / 2);
		var props = domState.rect;
		var left = props.left + (props.width / 2);
		var _p1 = A2(getValuesFor, left, marginLeft);
		var newLeft = _p1._0;
		var newMarginLeft = _p1._1;
		var top = props.top + (props.height / 2);
		var _p2 = A2(getValuesFor, top, marginTop);
		var newTop = _p2._0;
		var newMarginTop = _p2._1;
		var out = function () {
			var _p3 = pos;
			switch (_p3.ctor) {
				case 'Left':
					return {left: (props.left - offsetWidth) - 10, top: newTop, marginTop: newMarginTop, marginLeft: 0};
				case 'Right':
					return {left: (props.left + props.width) + 10, top: newTop, marginTop: newMarginTop, marginLeft: 0};
				case 'Top':
					return {left: newLeft, top: (props.top - offsetHeight) - 10, marginTop: 0, marginLeft: newMarginLeft};
				default:
					return {left: newLeft, top: (props.top + props.height) + 10, marginTop: 0, marginLeft: newMarginLeft};
			}
		}();
		return out;
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$defaultDOMState = {
	rect: {left: 0, top: 0, width: 0, height: 0},
	offsetWidth: 0,
	offsetHeight: 0
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$defaultPos = {left: 0, top: 0, marginLeft: 0, marginTop: 0};
var _MichaelCombs28$elm_mdl$Material_Tooltip$defaultModel = {isActive: false, domState: _MichaelCombs28$elm_mdl$Material_Tooltip$defaultDOMState};
var _MichaelCombs28$elm_mdl$Material_Tooltip$pack = A4(
	_MichaelCombs28$elm_parts$Parts$pack,
	_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Tooltip$update),
	function (_) {
		return _.tooltip;
	},
	_MichaelCombs28$elm_mdl$Material_Tooltip$set,
	_MichaelCombs28$elm_mdl$Material_Tooltip$defaultModel);
var _MichaelCombs28$elm_mdl$Material_Tooltip$Model = F2(
	function (a, b) {
		return {isActive: a, domState: b};
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Pos = F4(
	function (a, b, c, d) {
		return {left: a, top: b, marginLeft: c, marginTop: d};
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$DOMState = F3(
	function (a, b, c) {
		return {rect: a, offsetWidth: b, offsetHeight: c};
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$stateDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_MichaelCombs28$elm_mdl$Material_Tooltip$DOMState,
	_MichaelCombs28$elm_dom$DOM$target(_MichaelCombs28$elm_dom$DOM$boundingClientRect),
	_MichaelCombs28$elm_mdl$Material_Tooltip$sibling(_MichaelCombs28$elm_dom$DOM$offsetWidth),
	_MichaelCombs28$elm_mdl$Material_Tooltip$sibling(_MichaelCombs28$elm_dom$DOM$offsetHeight));
var _MichaelCombs28$elm_mdl$Material_Tooltip$Config = F3(
	function (a, b, c) {
		return {size: a, position: b, container: c};
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Leave = {ctor: 'Leave'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$onMouseLeave = F2(
	function (lift, idx) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'mouseleave',
			_elm_lang$core$Json_Decode$succeed(
				A3(_MichaelCombs28$elm_mdl$Material_Tooltip$pack, lift, idx, _MichaelCombs28$elm_mdl$Material_Tooltip$Leave)));
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$onLeave = function (lift) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(
			lift(_MichaelCombs28$elm_mdl$Material_Tooltip$Leave)));
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$Enter = function (a) {
	return {ctor: 'Enter', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$onMouseEnter = F2(
	function (lift, idx) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'mouseenter',
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p4) {
					return A3(
						_MichaelCombs28$elm_mdl$Material_Tooltip$pack,
						lift,
						idx,
						_MichaelCombs28$elm_mdl$Material_Tooltip$Enter(_p4));
				},
				_MichaelCombs28$elm_mdl$Material_Tooltip$stateDecoder));
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$attach = F2(
	function (lift, index) {
		return _MichaelCombs28$elm_mdl$Material_Options$many(
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
					A2(_MichaelCombs28$elm_mdl$Material_Tooltip$onMouseEnter, lift, index)),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
						A2(_MichaelCombs28$elm_mdl$Material_Tooltip$onMouseLeave, lift, index)),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$onEnter = function (lift) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		A2(
			_elm_lang$core$Json_Decode$map,
			function (_p5) {
				return lift(
					_MichaelCombs28$elm_mdl$Material_Tooltip$Enter(_p5));
			},
			_MichaelCombs28$elm_mdl$Material_Tooltip$stateDecoder));
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$Large = {ctor: 'Large'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$large = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{size: _MichaelCombs28$elm_mdl$Material_Tooltip$Large});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Default = {ctor: 'Default'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$Bottom = {ctor: 'Bottom'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$defaultConfig = {size: _MichaelCombs28$elm_mdl$Material_Tooltip$Default, position: _MichaelCombs28$elm_mdl$Material_Tooltip$Bottom, container: _elm_lang$html$Html$div};
var _MichaelCombs28$elm_mdl$Material_Tooltip$view = F4(
	function (lift, model, options, content) {
		var px = function (f) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(f),
				'px');
		};
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Tooltip$defaultConfig, options);
		var config = summary.config;
		var pos = model.isActive ? A2(_MichaelCombs28$elm_mdl$Material_Tooltip$calculatePos, config.position, model.domState) : _MichaelCombs28$elm_mdl$Material_Tooltip$defaultPos;
		return A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			config.container,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tooltip'),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$when,
						_MichaelCombs28$elm_mdl$Material_Options$cs('is-active'),
						model.isActive),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tooltip--large'),
							_elm_lang$core$Native_Utils.eq(config.size, _MichaelCombs28$elm_mdl$Material_Tooltip$Large)),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								A2(
									_MichaelCombs28$elm_mdl$Material_Options$css,
									'left',
									px(pos.left)),
								model.isActive),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Options$when,
									A2(
										_MichaelCombs28$elm_mdl$Material_Options$css,
										'margin-left',
										px(pos.marginLeft)),
									model.isActive),
								_1: {
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Options$when,
										A2(
											_MichaelCombs28$elm_mdl$Material_Options$css,
											'top',
											px(pos.top)),
										model.isActive),
									_1: {
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Options$when,
											A2(
												_MichaelCombs28$elm_mdl$Material_Options$css,
												'margin-top',
												px(pos.marginTop)),
											model.isActive),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			content);
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Tooltip$view,
	_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Tooltip$update),
	function (_) {
		return _.tooltip;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{tooltip: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Tooltip$defaultModel);
var _MichaelCombs28$elm_mdl$Material_Tooltip$bottom = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _MichaelCombs28$elm_mdl$Material_Tooltip$Bottom});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Top = {ctor: 'Top'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$top = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _MichaelCombs28$elm_mdl$Material_Tooltip$Top});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Right = {ctor: 'Right'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$right = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _MichaelCombs28$elm_mdl$Material_Tooltip$Right});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Left = {ctor: 'Left'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$left = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _MichaelCombs28$elm_mdl$Material_Tooltip$Left});
	});

var _MichaelCombs28$elm_mdl$Material_Tabs$activeTab = function (k) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{activeTab: k});
		});
};
var _MichaelCombs28$elm_mdl$Material_Tabs$onSelectTab = function (k) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onSelectTab: _elm_lang$core$Maybe$Just(k)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Tabs$ripple = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$defaultConfig = {ripple: false, onSelectTab: _elm_lang$core$Maybe$Nothing, activeTab: 0};
var _MichaelCombs28$elm_mdl$Material_Tabs$defaultModel = {ripples: _elm_lang$core$Dict$empty};
var _MichaelCombs28$elm_mdl$Material_Tabs$Model = function (a) {
	return {ripples: a};
};
var _MichaelCombs28$elm_mdl$Material_Tabs$Config = F3(
	function (a, b, c) {
		return {ripple: a, onSelectTab: b, activeTab: c};
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$Ripple = F2(
	function (a, b) {
		return {ctor: 'Ripple', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$update = F2(
	function (action, model) {
		var _p0 = action;
		var _p2 = _p0._0;
		var _p1 = A2(
			_MichaelCombs28$elm_mdl$Material_Ripple$update,
			_p0._1,
			A2(
				_elm_lang$core$Maybe$withDefault,
				_MichaelCombs28$elm_mdl$Material_Ripple$model,
				A2(_elm_lang$core$Dict$get, _p2, model.ripples)));
		var ripple_ = _p1._0;
		var cmd = _p1._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					ripples: A3(_elm_lang$core$Dict$insert, _p2, ripple_, model.ripples)
				}),
			_1: A2(
				_elm_lang$core$Platform_Cmd$map,
				_MichaelCombs28$elm_mdl$Material_Tabs$Ripple(_p2),
				cmd)
		};
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$view = F5(
	function (lift, model, options, tabs, tabContent) {
		var wrapContent = A2(
			_elm_lang$html$Html_Keyed$node,
			'div',
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-tab__panel', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-active', _1: true},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Tabs$defaultConfig, options);
		var config = summary.config;
		var unwrapLabel = F2(
			function (tabIdx, _p3) {
				var _p4 = _p3;
				var _p6 = _p4._0._1;
				return A3(
					_MichaelCombs28$elm_mdl$Material_Options$styled,
					_elm_lang$html$Html$a,
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tabs__tab'),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Options$when,
									_MichaelCombs28$elm_mdl$Material_Options$cs('is-active'),
									_elm_lang$core$Native_Utils.eq(tabIdx, config.activeTab)),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Maybe$withDefault,
										_MichaelCombs28$elm_mdl$Material_Options$nop,
										A2(
											_elm_lang$core$Maybe$map,
											function (t) {
												return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
													_elm_lang$html$Html_Events$onClick(
														t(tabIdx)));
											},
											config.onSelectTab)),
									_1: {ctor: '[]'}
								}
							}
						},
						_p4._0._0),
					config.ripple ? _elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: _p6,
							_1: {
								ctor: '::',
								_0: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$map,
										function (_p5) {
											return lift(
												A2(_MichaelCombs28$elm_mdl$Material_Tabs$Ripple, tabIdx, _p5));
										},
										A2(
											_MichaelCombs28$elm_mdl$Material_Ripple$view,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$classList(
													{
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'mdl-tabs__ripple-container', _1: true},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'mdl-tabs__ripple-js-effect', _1: true},
															_1: {ctor: '[]'}
														}
													}),
												_1: {ctor: '[]'}
											},
											A2(
												_elm_lang$core$Maybe$withDefault,
												_MichaelCombs28$elm_mdl$Material_Ripple$model,
												A2(_elm_lang$core$Dict$get, tabIdx, model.ripples)))),
									_1: {ctor: '[]'}
								},
								_1: {ctor: '[]'}
							}
						}) : _p6);
			});
		var links = A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tabs__tab-bar'),
				_1: {ctor: '[]'}
			},
			A2(_elm_lang$core$List$indexedMap, unwrapLabel, tabs));
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tabs'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-tabs'),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('is-upgraded'),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
								config.ripple),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Options$when,
									_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect--ignore-events'),
									config.ripple),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: links,
				_1: {
					ctor: '::',
					_0: wrapContent(
						{
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Basics$toString(config.activeTab),
								_1: A2(
									_elm_lang$html$Html$div,
									{ctor: '[]'},
									tabContent)
							},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Tabs$view,
	_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Tabs$update),
	function (_) {
		return _.tabs;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{tabs: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Tabs$defaultModel);
var _MichaelCombs28$elm_mdl$Material_Tabs$Label = function (a) {
	return {ctor: 'Label', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Tabs$label = F2(
	function (p, c) {
		return _MichaelCombs28$elm_mdl$Material_Tabs$Label(
			{ctor: '_Tuple2', _0: p, _1: c});
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$textLabel = F2(
	function (p, c) {
		return A2(
			_MichaelCombs28$elm_mdl$Material_Tabs$label,
			p,
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(c),
				_1: {ctor: '[]'}
			});
	});

var _MichaelCombs28$elm_mdl$Material$init = function (lift) {
	return _MichaelCombs28$elm_mdl$Material_Layout$sub0(lift);
};
var _MichaelCombs28$elm_mdl$Material$subscriptions = F2(
	function (lift, model) {
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: A2(_MichaelCombs28$elm_mdl$Material_Layout$subs, lift, model.mdl),
				_1: {
					ctor: '::',
					_0: A2(_MichaelCombs28$elm_mdl$Material_Menu$subs, lift, model.mdl),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material$update = F2(
	function (msg, model) {
		var helper = function (_p0) {
			var _p1 = _p0;
			var _p2 = _p1._0;
			if (_p2.ctor === 'Just') {
				return _elm_lang$core$Maybe$Just(
					{ctor: '_Tuple2', _0: _p2._0, _1: _p1._1});
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		};
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none},
			A2(
				_elm_lang$core$Maybe$map,
				_MichaelCombs28$elm_mdl$Material_Helpers$map1st(
					function (mdl) {
						return _elm_lang$core$Native_Utils.update(
							model,
							{mdl: mdl});
					}),
				helper(
					A2(_MichaelCombs28$elm_parts$Parts$update_, msg, model.mdl))));
	});
var _MichaelCombs28$elm_mdl$Material$model = {button: _elm_lang$core$Dict$empty, textfield: _elm_lang$core$Dict$empty, menu: _elm_lang$core$Dict$empty, snackbar: _elm_lang$core$Maybe$Nothing, layout: _MichaelCombs28$elm_mdl$Material_Layout$defaultModel, toggles: _elm_lang$core$Dict$empty, tooltip: _elm_lang$core$Dict$empty, tabs: _elm_lang$core$Dict$empty};
var _MichaelCombs28$elm_mdl$Material$Model = F8(
	function (a, b, c, d, e, f, g, h) {
		return {button: a, textfield: b, menu: c, snackbar: d, layout: e, toggles: f, tooltip: g, tabs: h};
	});

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _MichaelCombs28$elm_mdl$Material_List$action2 = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-secondary-action');
var _MichaelCombs28$elm_mdl$Material_List$info2 = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-secondary-info'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$content2 = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-secondary-content'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$subtitle = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-sub-title'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$body = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-text-body'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$icon = F2(
	function (i, options) {
		return A2(
			_MichaelCombs28$elm_mdl$Material_Icon$view,
			i,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-icon'),
				_1: options
			});
	});
var _MichaelCombs28$elm_mdl$Material_List$avatar = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-avatar');
var _MichaelCombs28$elm_mdl$Material_List$avatarImage = F2(
	function (src, options) {
		return A4(
			_MichaelCombs28$elm_mdl$Material_Options$styled_,
			_elm_lang$html$Html$img,
			{ctor: '::', _0: _MichaelCombs28$elm_mdl$Material_List$avatar, _1: options},
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$src(src),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'});
	});
var _MichaelCombs28$elm_mdl$Material_List$avatarIcon = F2(
	function (i, options) {
		return A2(
			_MichaelCombs28$elm_mdl$Material_Options$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$center,
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$many(options),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_List$avatar,
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Icon$i(i),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_List$content = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-primary-content'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$withSubtitle = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item--two-line');
var _MichaelCombs28$elm_mdl$Material_List$withBody = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item--three-line');
var _MichaelCombs28$elm_mdl$Material_List$li = function (options) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Options$styled,
		_elm_lang$html$Html$li,
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$ul = function (options) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Options$styled,
		_elm_lang$html$Html$ul,
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list'),
			_1: options
		});
};

//import Result //

var _elm_lang$core$Native_Date = function() {

function fromString(str)
{
	var date = new Date(str);
	return isNaN(date.getTime())
		? _elm_lang$core$Result$Err('Unable to parse \'' + str + '\' as a date. Dates must be in the ISO 8601 format.')
		: _elm_lang$core$Result$Ok(date);
}

var dayTable = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var monthTable =
	['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


return {
	fromString: fromString,
	year: function(d) { return d.getFullYear(); },
	month: function(d) { return { ctor: monthTable[d.getMonth()] }; },
	day: function(d) { return d.getDate(); },
	hour: function(d) { return d.getHours(); },
	minute: function(d) { return d.getMinutes(); },
	second: function(d) { return d.getSeconds(); },
	millisecond: function(d) { return d.getMilliseconds(); },
	toTime: function(d) { return d.getTime(); },
	fromTime: function(t) { return new Date(t); },
	dayOfWeek: function(d) { return { ctor: dayTable[d.getDay()] }; }
};

}();
var _elm_lang$core$Date$millisecond = _elm_lang$core$Native_Date.millisecond;
var _elm_lang$core$Date$second = _elm_lang$core$Native_Date.second;
var _elm_lang$core$Date$minute = _elm_lang$core$Native_Date.minute;
var _elm_lang$core$Date$hour = _elm_lang$core$Native_Date.hour;
var _elm_lang$core$Date$dayOfWeek = _elm_lang$core$Native_Date.dayOfWeek;
var _elm_lang$core$Date$day = _elm_lang$core$Native_Date.day;
var _elm_lang$core$Date$month = _elm_lang$core$Native_Date.month;
var _elm_lang$core$Date$year = _elm_lang$core$Native_Date.year;
var _elm_lang$core$Date$fromTime = _elm_lang$core$Native_Date.fromTime;
var _elm_lang$core$Date$toTime = _elm_lang$core$Native_Date.toTime;
var _elm_lang$core$Date$fromString = _elm_lang$core$Native_Date.fromString;
var _elm_lang$core$Date$now = A2(_elm_lang$core$Task$map, _elm_lang$core$Date$fromTime, _elm_lang$core$Time$now);
var _elm_lang$core$Date$Date = {ctor: 'Date'};
var _elm_lang$core$Date$Sun = {ctor: 'Sun'};
var _elm_lang$core$Date$Sat = {ctor: 'Sat'};
var _elm_lang$core$Date$Fri = {ctor: 'Fri'};
var _elm_lang$core$Date$Thu = {ctor: 'Thu'};
var _elm_lang$core$Date$Wed = {ctor: 'Wed'};
var _elm_lang$core$Date$Tue = {ctor: 'Tue'};
var _elm_lang$core$Date$Mon = {ctor: 'Mon'};
var _elm_lang$core$Date$Dec = {ctor: 'Dec'};
var _elm_lang$core$Date$Nov = {ctor: 'Nov'};
var _elm_lang$core$Date$Oct = {ctor: 'Oct'};
var _elm_lang$core$Date$Sep = {ctor: 'Sep'};
var _elm_lang$core$Date$Aug = {ctor: 'Aug'};
var _elm_lang$core$Date$Jul = {ctor: 'Jul'};
var _elm_lang$core$Date$Jun = {ctor: 'Jun'};
var _elm_lang$core$Date$May = {ctor: 'May'};
var _elm_lang$core$Date$Apr = {ctor: 'Apr'};
var _elm_lang$core$Date$Mar = {ctor: 'Mar'};
var _elm_lang$core$Date$Feb = {ctor: 'Feb'};
var _elm_lang$core$Date$Jan = {ctor: 'Jan'};

var _elm_lang$html$Html_Lazy$lazy3 = _elm_lang$virtual_dom$VirtualDom$lazy3;
var _elm_lang$html$Html_Lazy$lazy2 = _elm_lang$virtual_dom$VirtualDom$lazy2;
var _elm_lang$html$Html_Lazy$lazy = _elm_lang$virtual_dom$VirtualDom$lazy;

var _elm_lang$svg$Svg$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$svg$Svg$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$svg$Svg$svgNamespace = A2(
	_elm_lang$virtual_dom$VirtualDom$property,
	'namespace',
	_elm_lang$core$Json_Encode$string('http://www.w3.org/2000/svg'));
var _elm_lang$svg$Svg$node = F3(
	function (name, attributes, children) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			name,
			{ctor: '::', _0: _elm_lang$svg$Svg$svgNamespace, _1: attributes},
			children);
	});
var _elm_lang$svg$Svg$svg = _elm_lang$svg$Svg$node('svg');
var _elm_lang$svg$Svg$foreignObject = _elm_lang$svg$Svg$node('foreignObject');
var _elm_lang$svg$Svg$animate = _elm_lang$svg$Svg$node('animate');
var _elm_lang$svg$Svg$animateColor = _elm_lang$svg$Svg$node('animateColor');
var _elm_lang$svg$Svg$animateMotion = _elm_lang$svg$Svg$node('animateMotion');
var _elm_lang$svg$Svg$animateTransform = _elm_lang$svg$Svg$node('animateTransform');
var _elm_lang$svg$Svg$mpath = _elm_lang$svg$Svg$node('mpath');
var _elm_lang$svg$Svg$set = _elm_lang$svg$Svg$node('set');
var _elm_lang$svg$Svg$a = _elm_lang$svg$Svg$node('a');
var _elm_lang$svg$Svg$defs = _elm_lang$svg$Svg$node('defs');
var _elm_lang$svg$Svg$g = _elm_lang$svg$Svg$node('g');
var _elm_lang$svg$Svg$marker = _elm_lang$svg$Svg$node('marker');
var _elm_lang$svg$Svg$mask = _elm_lang$svg$Svg$node('mask');
var _elm_lang$svg$Svg$pattern = _elm_lang$svg$Svg$node('pattern');
var _elm_lang$svg$Svg$switch = _elm_lang$svg$Svg$node('switch');
var _elm_lang$svg$Svg$symbol = _elm_lang$svg$Svg$node('symbol');
var _elm_lang$svg$Svg$desc = _elm_lang$svg$Svg$node('desc');
var _elm_lang$svg$Svg$metadata = _elm_lang$svg$Svg$node('metadata');
var _elm_lang$svg$Svg$title = _elm_lang$svg$Svg$node('title');
var _elm_lang$svg$Svg$feBlend = _elm_lang$svg$Svg$node('feBlend');
var _elm_lang$svg$Svg$feColorMatrix = _elm_lang$svg$Svg$node('feColorMatrix');
var _elm_lang$svg$Svg$feComponentTransfer = _elm_lang$svg$Svg$node('feComponentTransfer');
var _elm_lang$svg$Svg$feComposite = _elm_lang$svg$Svg$node('feComposite');
var _elm_lang$svg$Svg$feConvolveMatrix = _elm_lang$svg$Svg$node('feConvolveMatrix');
var _elm_lang$svg$Svg$feDiffuseLighting = _elm_lang$svg$Svg$node('feDiffuseLighting');
var _elm_lang$svg$Svg$feDisplacementMap = _elm_lang$svg$Svg$node('feDisplacementMap');
var _elm_lang$svg$Svg$feFlood = _elm_lang$svg$Svg$node('feFlood');
var _elm_lang$svg$Svg$feFuncA = _elm_lang$svg$Svg$node('feFuncA');
var _elm_lang$svg$Svg$feFuncB = _elm_lang$svg$Svg$node('feFuncB');
var _elm_lang$svg$Svg$feFuncG = _elm_lang$svg$Svg$node('feFuncG');
var _elm_lang$svg$Svg$feFuncR = _elm_lang$svg$Svg$node('feFuncR');
var _elm_lang$svg$Svg$feGaussianBlur = _elm_lang$svg$Svg$node('feGaussianBlur');
var _elm_lang$svg$Svg$feImage = _elm_lang$svg$Svg$node('feImage');
var _elm_lang$svg$Svg$feMerge = _elm_lang$svg$Svg$node('feMerge');
var _elm_lang$svg$Svg$feMergeNode = _elm_lang$svg$Svg$node('feMergeNode');
var _elm_lang$svg$Svg$feMorphology = _elm_lang$svg$Svg$node('feMorphology');
var _elm_lang$svg$Svg$feOffset = _elm_lang$svg$Svg$node('feOffset');
var _elm_lang$svg$Svg$feSpecularLighting = _elm_lang$svg$Svg$node('feSpecularLighting');
var _elm_lang$svg$Svg$feTile = _elm_lang$svg$Svg$node('feTile');
var _elm_lang$svg$Svg$feTurbulence = _elm_lang$svg$Svg$node('feTurbulence');
var _elm_lang$svg$Svg$font = _elm_lang$svg$Svg$node('font');
var _elm_lang$svg$Svg$linearGradient = _elm_lang$svg$Svg$node('linearGradient');
var _elm_lang$svg$Svg$radialGradient = _elm_lang$svg$Svg$node('radialGradient');
var _elm_lang$svg$Svg$stop = _elm_lang$svg$Svg$node('stop');
var _elm_lang$svg$Svg$circle = _elm_lang$svg$Svg$node('circle');
var _elm_lang$svg$Svg$ellipse = _elm_lang$svg$Svg$node('ellipse');
var _elm_lang$svg$Svg$image = _elm_lang$svg$Svg$node('image');
var _elm_lang$svg$Svg$line = _elm_lang$svg$Svg$node('line');
var _elm_lang$svg$Svg$path = _elm_lang$svg$Svg$node('path');
var _elm_lang$svg$Svg$polygon = _elm_lang$svg$Svg$node('polygon');
var _elm_lang$svg$Svg$polyline = _elm_lang$svg$Svg$node('polyline');
var _elm_lang$svg$Svg$rect = _elm_lang$svg$Svg$node('rect');
var _elm_lang$svg$Svg$use = _elm_lang$svg$Svg$node('use');
var _elm_lang$svg$Svg$feDistantLight = _elm_lang$svg$Svg$node('feDistantLight');
var _elm_lang$svg$Svg$fePointLight = _elm_lang$svg$Svg$node('fePointLight');
var _elm_lang$svg$Svg$feSpotLight = _elm_lang$svg$Svg$node('feSpotLight');
var _elm_lang$svg$Svg$altGlyph = _elm_lang$svg$Svg$node('altGlyph');
var _elm_lang$svg$Svg$altGlyphDef = _elm_lang$svg$Svg$node('altGlyphDef');
var _elm_lang$svg$Svg$altGlyphItem = _elm_lang$svg$Svg$node('altGlyphItem');
var _elm_lang$svg$Svg$glyph = _elm_lang$svg$Svg$node('glyph');
var _elm_lang$svg$Svg$glyphRef = _elm_lang$svg$Svg$node('glyphRef');
var _elm_lang$svg$Svg$textPath = _elm_lang$svg$Svg$node('textPath');
var _elm_lang$svg$Svg$text_ = _elm_lang$svg$Svg$node('text');
var _elm_lang$svg$Svg$tref = _elm_lang$svg$Svg$node('tref');
var _elm_lang$svg$Svg$tspan = _elm_lang$svg$Svg$node('tspan');
var _elm_lang$svg$Svg$clipPath = _elm_lang$svg$Svg$node('clipPath');
var _elm_lang$svg$Svg$colorProfile = _elm_lang$svg$Svg$node('colorProfile');
var _elm_lang$svg$Svg$cursor = _elm_lang$svg$Svg$node('cursor');
var _elm_lang$svg$Svg$filter = _elm_lang$svg$Svg$node('filter');
var _elm_lang$svg$Svg$script = _elm_lang$svg$Svg$node('script');
var _elm_lang$svg$Svg$style = _elm_lang$svg$Svg$node('style');
var _elm_lang$svg$Svg$view = _elm_lang$svg$Svg$node('view');

var _elm_lang$svg$Svg_Attributes$writingMode = _elm_lang$virtual_dom$VirtualDom$attribute('writing-mode');
var _elm_lang$svg$Svg_Attributes$wordSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('word-spacing');
var _elm_lang$svg$Svg_Attributes$visibility = _elm_lang$virtual_dom$VirtualDom$attribute('visibility');
var _elm_lang$svg$Svg_Attributes$unicodeBidi = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-bidi');
var _elm_lang$svg$Svg_Attributes$textRendering = _elm_lang$virtual_dom$VirtualDom$attribute('text-rendering');
var _elm_lang$svg$Svg_Attributes$textDecoration = _elm_lang$virtual_dom$VirtualDom$attribute('text-decoration');
var _elm_lang$svg$Svg_Attributes$textAnchor = _elm_lang$virtual_dom$VirtualDom$attribute('text-anchor');
var _elm_lang$svg$Svg_Attributes$stroke = _elm_lang$virtual_dom$VirtualDom$attribute('stroke');
var _elm_lang$svg$Svg_Attributes$strokeWidth = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-width');
var _elm_lang$svg$Svg_Attributes$strokeOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-opacity');
var _elm_lang$svg$Svg_Attributes$strokeMiterlimit = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-miterlimit');
var _elm_lang$svg$Svg_Attributes$strokeLinejoin = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linejoin');
var _elm_lang$svg$Svg_Attributes$strokeLinecap = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-linecap');
var _elm_lang$svg$Svg_Attributes$strokeDashoffset = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dashoffset');
var _elm_lang$svg$Svg_Attributes$strokeDasharray = _elm_lang$virtual_dom$VirtualDom$attribute('stroke-dasharray');
var _elm_lang$svg$Svg_Attributes$stopOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('stop-opacity');
var _elm_lang$svg$Svg_Attributes$stopColor = _elm_lang$virtual_dom$VirtualDom$attribute('stop-color');
var _elm_lang$svg$Svg_Attributes$shapeRendering = _elm_lang$virtual_dom$VirtualDom$attribute('shape-rendering');
var _elm_lang$svg$Svg_Attributes$pointerEvents = _elm_lang$virtual_dom$VirtualDom$attribute('pointer-events');
var _elm_lang$svg$Svg_Attributes$overflow = _elm_lang$virtual_dom$VirtualDom$attribute('overflow');
var _elm_lang$svg$Svg_Attributes$opacity = _elm_lang$virtual_dom$VirtualDom$attribute('opacity');
var _elm_lang$svg$Svg_Attributes$mask = _elm_lang$virtual_dom$VirtualDom$attribute('mask');
var _elm_lang$svg$Svg_Attributes$markerStart = _elm_lang$virtual_dom$VirtualDom$attribute('marker-start');
var _elm_lang$svg$Svg_Attributes$markerMid = _elm_lang$virtual_dom$VirtualDom$attribute('marker-mid');
var _elm_lang$svg$Svg_Attributes$markerEnd = _elm_lang$virtual_dom$VirtualDom$attribute('marker-end');
var _elm_lang$svg$Svg_Attributes$lightingColor = _elm_lang$virtual_dom$VirtualDom$attribute('lighting-color');
var _elm_lang$svg$Svg_Attributes$letterSpacing = _elm_lang$virtual_dom$VirtualDom$attribute('letter-spacing');
var _elm_lang$svg$Svg_Attributes$kerning = _elm_lang$virtual_dom$VirtualDom$attribute('kerning');
var _elm_lang$svg$Svg_Attributes$imageRendering = _elm_lang$virtual_dom$VirtualDom$attribute('image-rendering');
var _elm_lang$svg$Svg_Attributes$glyphOrientationVertical = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-vertical');
var _elm_lang$svg$Svg_Attributes$glyphOrientationHorizontal = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-orientation-horizontal');
var _elm_lang$svg$Svg_Attributes$fontWeight = _elm_lang$virtual_dom$VirtualDom$attribute('font-weight');
var _elm_lang$svg$Svg_Attributes$fontVariant = _elm_lang$virtual_dom$VirtualDom$attribute('font-variant');
var _elm_lang$svg$Svg_Attributes$fontStyle = _elm_lang$virtual_dom$VirtualDom$attribute('font-style');
var _elm_lang$svg$Svg_Attributes$fontStretch = _elm_lang$virtual_dom$VirtualDom$attribute('font-stretch');
var _elm_lang$svg$Svg_Attributes$fontSize = _elm_lang$virtual_dom$VirtualDom$attribute('font-size');
var _elm_lang$svg$Svg_Attributes$fontSizeAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('font-size-adjust');
var _elm_lang$svg$Svg_Attributes$fontFamily = _elm_lang$virtual_dom$VirtualDom$attribute('font-family');
var _elm_lang$svg$Svg_Attributes$floodOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('flood-opacity');
var _elm_lang$svg$Svg_Attributes$floodColor = _elm_lang$virtual_dom$VirtualDom$attribute('flood-color');
var _elm_lang$svg$Svg_Attributes$filter = _elm_lang$virtual_dom$VirtualDom$attribute('filter');
var _elm_lang$svg$Svg_Attributes$fill = _elm_lang$virtual_dom$VirtualDom$attribute('fill');
var _elm_lang$svg$Svg_Attributes$fillRule = _elm_lang$virtual_dom$VirtualDom$attribute('fill-rule');
var _elm_lang$svg$Svg_Attributes$fillOpacity = _elm_lang$virtual_dom$VirtualDom$attribute('fill-opacity');
var _elm_lang$svg$Svg_Attributes$enableBackground = _elm_lang$virtual_dom$VirtualDom$attribute('enable-background');
var _elm_lang$svg$Svg_Attributes$dominantBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('dominant-baseline');
var _elm_lang$svg$Svg_Attributes$display = _elm_lang$virtual_dom$VirtualDom$attribute('display');
var _elm_lang$svg$Svg_Attributes$direction = _elm_lang$virtual_dom$VirtualDom$attribute('direction');
var _elm_lang$svg$Svg_Attributes$cursor = _elm_lang$virtual_dom$VirtualDom$attribute('cursor');
var _elm_lang$svg$Svg_Attributes$color = _elm_lang$virtual_dom$VirtualDom$attribute('color');
var _elm_lang$svg$Svg_Attributes$colorRendering = _elm_lang$virtual_dom$VirtualDom$attribute('color-rendering');
var _elm_lang$svg$Svg_Attributes$colorProfile = _elm_lang$virtual_dom$VirtualDom$attribute('color-profile');
var _elm_lang$svg$Svg_Attributes$colorInterpolation = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation');
var _elm_lang$svg$Svg_Attributes$colorInterpolationFilters = _elm_lang$virtual_dom$VirtualDom$attribute('color-interpolation-filters');
var _elm_lang$svg$Svg_Attributes$clip = _elm_lang$virtual_dom$VirtualDom$attribute('clip');
var _elm_lang$svg$Svg_Attributes$clipRule = _elm_lang$virtual_dom$VirtualDom$attribute('clip-rule');
var _elm_lang$svg$Svg_Attributes$clipPath = _elm_lang$virtual_dom$VirtualDom$attribute('clip-path');
var _elm_lang$svg$Svg_Attributes$baselineShift = _elm_lang$virtual_dom$VirtualDom$attribute('baseline-shift');
var _elm_lang$svg$Svg_Attributes$alignmentBaseline = _elm_lang$virtual_dom$VirtualDom$attribute('alignment-baseline');
var _elm_lang$svg$Svg_Attributes$zoomAndPan = _elm_lang$virtual_dom$VirtualDom$attribute('zoomAndPan');
var _elm_lang$svg$Svg_Attributes$z = _elm_lang$virtual_dom$VirtualDom$attribute('z');
var _elm_lang$svg$Svg_Attributes$yChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('yChannelSelector');
var _elm_lang$svg$Svg_Attributes$y2 = _elm_lang$virtual_dom$VirtualDom$attribute('y2');
var _elm_lang$svg$Svg_Attributes$y1 = _elm_lang$virtual_dom$VirtualDom$attribute('y1');
var _elm_lang$svg$Svg_Attributes$y = _elm_lang$virtual_dom$VirtualDom$attribute('y');
var _elm_lang$svg$Svg_Attributes$xmlSpace = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:space');
var _elm_lang$svg$Svg_Attributes$xmlLang = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:lang');
var _elm_lang$svg$Svg_Attributes$xmlBase = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/XML/1998/namespace', 'xml:base');
var _elm_lang$svg$Svg_Attributes$xlinkType = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:type');
var _elm_lang$svg$Svg_Attributes$xlinkTitle = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:title');
var _elm_lang$svg$Svg_Attributes$xlinkShow = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:show');
var _elm_lang$svg$Svg_Attributes$xlinkRole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:role');
var _elm_lang$svg$Svg_Attributes$xlinkHref = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:href');
var _elm_lang$svg$Svg_Attributes$xlinkArcrole = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:arcrole');
var _elm_lang$svg$Svg_Attributes$xlinkActuate = A2(_elm_lang$virtual_dom$VirtualDom$attributeNS, 'http://www.w3.org/1999/xlink', 'xlink:actuate');
var _elm_lang$svg$Svg_Attributes$xChannelSelector = _elm_lang$virtual_dom$VirtualDom$attribute('xChannelSelector');
var _elm_lang$svg$Svg_Attributes$x2 = _elm_lang$virtual_dom$VirtualDom$attribute('x2');
var _elm_lang$svg$Svg_Attributes$x1 = _elm_lang$virtual_dom$VirtualDom$attribute('x1');
var _elm_lang$svg$Svg_Attributes$xHeight = _elm_lang$virtual_dom$VirtualDom$attribute('x-height');
var _elm_lang$svg$Svg_Attributes$x = _elm_lang$virtual_dom$VirtualDom$attribute('x');
var _elm_lang$svg$Svg_Attributes$widths = _elm_lang$virtual_dom$VirtualDom$attribute('widths');
var _elm_lang$svg$Svg_Attributes$width = _elm_lang$virtual_dom$VirtualDom$attribute('width');
var _elm_lang$svg$Svg_Attributes$viewTarget = _elm_lang$virtual_dom$VirtualDom$attribute('viewTarget');
var _elm_lang$svg$Svg_Attributes$viewBox = _elm_lang$virtual_dom$VirtualDom$attribute('viewBox');
var _elm_lang$svg$Svg_Attributes$vertOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-y');
var _elm_lang$svg$Svg_Attributes$vertOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('vert-origin-x');
var _elm_lang$svg$Svg_Attributes$vertAdvY = _elm_lang$virtual_dom$VirtualDom$attribute('vert-adv-y');
var _elm_lang$svg$Svg_Attributes$version = _elm_lang$virtual_dom$VirtualDom$attribute('version');
var _elm_lang$svg$Svg_Attributes$values = _elm_lang$virtual_dom$VirtualDom$attribute('values');
var _elm_lang$svg$Svg_Attributes$vMathematical = _elm_lang$virtual_dom$VirtualDom$attribute('v-mathematical');
var _elm_lang$svg$Svg_Attributes$vIdeographic = _elm_lang$virtual_dom$VirtualDom$attribute('v-ideographic');
var _elm_lang$svg$Svg_Attributes$vHanging = _elm_lang$virtual_dom$VirtualDom$attribute('v-hanging');
var _elm_lang$svg$Svg_Attributes$vAlphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('v-alphabetic');
var _elm_lang$svg$Svg_Attributes$unitsPerEm = _elm_lang$virtual_dom$VirtualDom$attribute('units-per-em');
var _elm_lang$svg$Svg_Attributes$unicodeRange = _elm_lang$virtual_dom$VirtualDom$attribute('unicode-range');
var _elm_lang$svg$Svg_Attributes$unicode = _elm_lang$virtual_dom$VirtualDom$attribute('unicode');
var _elm_lang$svg$Svg_Attributes$underlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('underline-thickness');
var _elm_lang$svg$Svg_Attributes$underlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('underline-position');
var _elm_lang$svg$Svg_Attributes$u2 = _elm_lang$virtual_dom$VirtualDom$attribute('u2');
var _elm_lang$svg$Svg_Attributes$u1 = _elm_lang$virtual_dom$VirtualDom$attribute('u1');
var _elm_lang$svg$Svg_Attributes$type_ = _elm_lang$virtual_dom$VirtualDom$attribute('type');
var _elm_lang$svg$Svg_Attributes$transform = _elm_lang$virtual_dom$VirtualDom$attribute('transform');
var _elm_lang$svg$Svg_Attributes$to = _elm_lang$virtual_dom$VirtualDom$attribute('to');
var _elm_lang$svg$Svg_Attributes$title = _elm_lang$virtual_dom$VirtualDom$attribute('title');
var _elm_lang$svg$Svg_Attributes$textLength = _elm_lang$virtual_dom$VirtualDom$attribute('textLength');
var _elm_lang$svg$Svg_Attributes$targetY = _elm_lang$virtual_dom$VirtualDom$attribute('targetY');
var _elm_lang$svg$Svg_Attributes$targetX = _elm_lang$virtual_dom$VirtualDom$attribute('targetX');
var _elm_lang$svg$Svg_Attributes$target = _elm_lang$virtual_dom$VirtualDom$attribute('target');
var _elm_lang$svg$Svg_Attributes$tableValues = _elm_lang$virtual_dom$VirtualDom$attribute('tableValues');
var _elm_lang$svg$Svg_Attributes$systemLanguage = _elm_lang$virtual_dom$VirtualDom$attribute('systemLanguage');
var _elm_lang$svg$Svg_Attributes$surfaceScale = _elm_lang$virtual_dom$VirtualDom$attribute('surfaceScale');
var _elm_lang$svg$Svg_Attributes$style = _elm_lang$virtual_dom$VirtualDom$attribute('style');
var _elm_lang$svg$Svg_Attributes$string = _elm_lang$virtual_dom$VirtualDom$attribute('string');
var _elm_lang$svg$Svg_Attributes$strikethroughThickness = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-thickness');
var _elm_lang$svg$Svg_Attributes$strikethroughPosition = _elm_lang$virtual_dom$VirtualDom$attribute('strikethrough-position');
var _elm_lang$svg$Svg_Attributes$stitchTiles = _elm_lang$virtual_dom$VirtualDom$attribute('stitchTiles');
var _elm_lang$svg$Svg_Attributes$stemv = _elm_lang$virtual_dom$VirtualDom$attribute('stemv');
var _elm_lang$svg$Svg_Attributes$stemh = _elm_lang$virtual_dom$VirtualDom$attribute('stemh');
var _elm_lang$svg$Svg_Attributes$stdDeviation = _elm_lang$virtual_dom$VirtualDom$attribute('stdDeviation');
var _elm_lang$svg$Svg_Attributes$startOffset = _elm_lang$virtual_dom$VirtualDom$attribute('startOffset');
var _elm_lang$svg$Svg_Attributes$spreadMethod = _elm_lang$virtual_dom$VirtualDom$attribute('spreadMethod');
var _elm_lang$svg$Svg_Attributes$speed = _elm_lang$virtual_dom$VirtualDom$attribute('speed');
var _elm_lang$svg$Svg_Attributes$specularExponent = _elm_lang$virtual_dom$VirtualDom$attribute('specularExponent');
var _elm_lang$svg$Svg_Attributes$specularConstant = _elm_lang$virtual_dom$VirtualDom$attribute('specularConstant');
var _elm_lang$svg$Svg_Attributes$spacing = _elm_lang$virtual_dom$VirtualDom$attribute('spacing');
var _elm_lang$svg$Svg_Attributes$slope = _elm_lang$virtual_dom$VirtualDom$attribute('slope');
var _elm_lang$svg$Svg_Attributes$seed = _elm_lang$virtual_dom$VirtualDom$attribute('seed');
var _elm_lang$svg$Svg_Attributes$scale = _elm_lang$virtual_dom$VirtualDom$attribute('scale');
var _elm_lang$svg$Svg_Attributes$ry = _elm_lang$virtual_dom$VirtualDom$attribute('ry');
var _elm_lang$svg$Svg_Attributes$rx = _elm_lang$virtual_dom$VirtualDom$attribute('rx');
var _elm_lang$svg$Svg_Attributes$rotate = _elm_lang$virtual_dom$VirtualDom$attribute('rotate');
var _elm_lang$svg$Svg_Attributes$result = _elm_lang$virtual_dom$VirtualDom$attribute('result');
var _elm_lang$svg$Svg_Attributes$restart = _elm_lang$virtual_dom$VirtualDom$attribute('restart');
var _elm_lang$svg$Svg_Attributes$requiredFeatures = _elm_lang$virtual_dom$VirtualDom$attribute('requiredFeatures');
var _elm_lang$svg$Svg_Attributes$requiredExtensions = _elm_lang$virtual_dom$VirtualDom$attribute('requiredExtensions');
var _elm_lang$svg$Svg_Attributes$repeatDur = _elm_lang$virtual_dom$VirtualDom$attribute('repeatDur');
var _elm_lang$svg$Svg_Attributes$repeatCount = _elm_lang$virtual_dom$VirtualDom$attribute('repeatCount');
var _elm_lang$svg$Svg_Attributes$renderingIntent = _elm_lang$virtual_dom$VirtualDom$attribute('rendering-intent');
var _elm_lang$svg$Svg_Attributes$refY = _elm_lang$virtual_dom$VirtualDom$attribute('refY');
var _elm_lang$svg$Svg_Attributes$refX = _elm_lang$virtual_dom$VirtualDom$attribute('refX');
var _elm_lang$svg$Svg_Attributes$radius = _elm_lang$virtual_dom$VirtualDom$attribute('radius');
var _elm_lang$svg$Svg_Attributes$r = _elm_lang$virtual_dom$VirtualDom$attribute('r');
var _elm_lang$svg$Svg_Attributes$primitiveUnits = _elm_lang$virtual_dom$VirtualDom$attribute('primitiveUnits');
var _elm_lang$svg$Svg_Attributes$preserveAspectRatio = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAspectRatio');
var _elm_lang$svg$Svg_Attributes$preserveAlpha = _elm_lang$virtual_dom$VirtualDom$attribute('preserveAlpha');
var _elm_lang$svg$Svg_Attributes$pointsAtZ = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtZ');
var _elm_lang$svg$Svg_Attributes$pointsAtY = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtY');
var _elm_lang$svg$Svg_Attributes$pointsAtX = _elm_lang$virtual_dom$VirtualDom$attribute('pointsAtX');
var _elm_lang$svg$Svg_Attributes$points = _elm_lang$virtual_dom$VirtualDom$attribute('points');
var _elm_lang$svg$Svg_Attributes$pointOrder = _elm_lang$virtual_dom$VirtualDom$attribute('point-order');
var _elm_lang$svg$Svg_Attributes$patternUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternUnits');
var _elm_lang$svg$Svg_Attributes$patternTransform = _elm_lang$virtual_dom$VirtualDom$attribute('patternTransform');
var _elm_lang$svg$Svg_Attributes$patternContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('patternContentUnits');
var _elm_lang$svg$Svg_Attributes$pathLength = _elm_lang$virtual_dom$VirtualDom$attribute('pathLength');
var _elm_lang$svg$Svg_Attributes$path = _elm_lang$virtual_dom$VirtualDom$attribute('path');
var _elm_lang$svg$Svg_Attributes$panose1 = _elm_lang$virtual_dom$VirtualDom$attribute('panose-1');
var _elm_lang$svg$Svg_Attributes$overlineThickness = _elm_lang$virtual_dom$VirtualDom$attribute('overline-thickness');
var _elm_lang$svg$Svg_Attributes$overlinePosition = _elm_lang$virtual_dom$VirtualDom$attribute('overline-position');
var _elm_lang$svg$Svg_Attributes$origin = _elm_lang$virtual_dom$VirtualDom$attribute('origin');
var _elm_lang$svg$Svg_Attributes$orientation = _elm_lang$virtual_dom$VirtualDom$attribute('orientation');
var _elm_lang$svg$Svg_Attributes$orient = _elm_lang$virtual_dom$VirtualDom$attribute('orient');
var _elm_lang$svg$Svg_Attributes$order = _elm_lang$virtual_dom$VirtualDom$attribute('order');
var _elm_lang$svg$Svg_Attributes$operator = _elm_lang$virtual_dom$VirtualDom$attribute('operator');
var _elm_lang$svg$Svg_Attributes$offset = _elm_lang$virtual_dom$VirtualDom$attribute('offset');
var _elm_lang$svg$Svg_Attributes$numOctaves = _elm_lang$virtual_dom$VirtualDom$attribute('numOctaves');
var _elm_lang$svg$Svg_Attributes$name = _elm_lang$virtual_dom$VirtualDom$attribute('name');
var _elm_lang$svg$Svg_Attributes$mode = _elm_lang$virtual_dom$VirtualDom$attribute('mode');
var _elm_lang$svg$Svg_Attributes$min = _elm_lang$virtual_dom$VirtualDom$attribute('min');
var _elm_lang$svg$Svg_Attributes$method = _elm_lang$virtual_dom$VirtualDom$attribute('method');
var _elm_lang$svg$Svg_Attributes$media = _elm_lang$virtual_dom$VirtualDom$attribute('media');
var _elm_lang$svg$Svg_Attributes$max = _elm_lang$virtual_dom$VirtualDom$attribute('max');
var _elm_lang$svg$Svg_Attributes$mathematical = _elm_lang$virtual_dom$VirtualDom$attribute('mathematical');
var _elm_lang$svg$Svg_Attributes$maskUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskUnits');
var _elm_lang$svg$Svg_Attributes$maskContentUnits = _elm_lang$virtual_dom$VirtualDom$attribute('maskContentUnits');
var _elm_lang$svg$Svg_Attributes$markerWidth = _elm_lang$virtual_dom$VirtualDom$attribute('markerWidth');
var _elm_lang$svg$Svg_Attributes$markerUnits = _elm_lang$virtual_dom$VirtualDom$attribute('markerUnits');
var _elm_lang$svg$Svg_Attributes$markerHeight = _elm_lang$virtual_dom$VirtualDom$attribute('markerHeight');
var _elm_lang$svg$Svg_Attributes$local = _elm_lang$virtual_dom$VirtualDom$attribute('local');
var _elm_lang$svg$Svg_Attributes$limitingConeAngle = _elm_lang$virtual_dom$VirtualDom$attribute('limitingConeAngle');
var _elm_lang$svg$Svg_Attributes$lengthAdjust = _elm_lang$virtual_dom$VirtualDom$attribute('lengthAdjust');
var _elm_lang$svg$Svg_Attributes$lang = _elm_lang$virtual_dom$VirtualDom$attribute('lang');
var _elm_lang$svg$Svg_Attributes$keyTimes = _elm_lang$virtual_dom$VirtualDom$attribute('keyTimes');
var _elm_lang$svg$Svg_Attributes$keySplines = _elm_lang$virtual_dom$VirtualDom$attribute('keySplines');
var _elm_lang$svg$Svg_Attributes$keyPoints = _elm_lang$virtual_dom$VirtualDom$attribute('keyPoints');
var _elm_lang$svg$Svg_Attributes$kernelUnitLength = _elm_lang$virtual_dom$VirtualDom$attribute('kernelUnitLength');
var _elm_lang$svg$Svg_Attributes$kernelMatrix = _elm_lang$virtual_dom$VirtualDom$attribute('kernelMatrix');
var _elm_lang$svg$Svg_Attributes$k4 = _elm_lang$virtual_dom$VirtualDom$attribute('k4');
var _elm_lang$svg$Svg_Attributes$k3 = _elm_lang$virtual_dom$VirtualDom$attribute('k3');
var _elm_lang$svg$Svg_Attributes$k2 = _elm_lang$virtual_dom$VirtualDom$attribute('k2');
var _elm_lang$svg$Svg_Attributes$k1 = _elm_lang$virtual_dom$VirtualDom$attribute('k1');
var _elm_lang$svg$Svg_Attributes$k = _elm_lang$virtual_dom$VirtualDom$attribute('k');
var _elm_lang$svg$Svg_Attributes$intercept = _elm_lang$virtual_dom$VirtualDom$attribute('intercept');
var _elm_lang$svg$Svg_Attributes$in2 = _elm_lang$virtual_dom$VirtualDom$attribute('in2');
var _elm_lang$svg$Svg_Attributes$in_ = _elm_lang$virtual_dom$VirtualDom$attribute('in');
var _elm_lang$svg$Svg_Attributes$ideographic = _elm_lang$virtual_dom$VirtualDom$attribute('ideographic');
var _elm_lang$svg$Svg_Attributes$id = _elm_lang$virtual_dom$VirtualDom$attribute('id');
var _elm_lang$svg$Svg_Attributes$horizOriginY = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-y');
var _elm_lang$svg$Svg_Attributes$horizOriginX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-origin-x');
var _elm_lang$svg$Svg_Attributes$horizAdvX = _elm_lang$virtual_dom$VirtualDom$attribute('horiz-adv-x');
var _elm_lang$svg$Svg_Attributes$height = _elm_lang$virtual_dom$VirtualDom$attribute('height');
var _elm_lang$svg$Svg_Attributes$hanging = _elm_lang$virtual_dom$VirtualDom$attribute('hanging');
var _elm_lang$svg$Svg_Attributes$gradientUnits = _elm_lang$virtual_dom$VirtualDom$attribute('gradientUnits');
var _elm_lang$svg$Svg_Attributes$gradientTransform = _elm_lang$virtual_dom$VirtualDom$attribute('gradientTransform');
var _elm_lang$svg$Svg_Attributes$glyphRef = _elm_lang$virtual_dom$VirtualDom$attribute('glyphRef');
var _elm_lang$svg$Svg_Attributes$glyphName = _elm_lang$virtual_dom$VirtualDom$attribute('glyph-name');
var _elm_lang$svg$Svg_Attributes$g2 = _elm_lang$virtual_dom$VirtualDom$attribute('g2');
var _elm_lang$svg$Svg_Attributes$g1 = _elm_lang$virtual_dom$VirtualDom$attribute('g1');
var _elm_lang$svg$Svg_Attributes$fy = _elm_lang$virtual_dom$VirtualDom$attribute('fy');
var _elm_lang$svg$Svg_Attributes$fx = _elm_lang$virtual_dom$VirtualDom$attribute('fx');
var _elm_lang$svg$Svg_Attributes$from = _elm_lang$virtual_dom$VirtualDom$attribute('from');
var _elm_lang$svg$Svg_Attributes$format = _elm_lang$virtual_dom$VirtualDom$attribute('format');
var _elm_lang$svg$Svg_Attributes$filterUnits = _elm_lang$virtual_dom$VirtualDom$attribute('filterUnits');
var _elm_lang$svg$Svg_Attributes$filterRes = _elm_lang$virtual_dom$VirtualDom$attribute('filterRes');
var _elm_lang$svg$Svg_Attributes$externalResourcesRequired = _elm_lang$virtual_dom$VirtualDom$attribute('externalResourcesRequired');
var _elm_lang$svg$Svg_Attributes$exponent = _elm_lang$virtual_dom$VirtualDom$attribute('exponent');
var _elm_lang$svg$Svg_Attributes$end = _elm_lang$virtual_dom$VirtualDom$attribute('end');
var _elm_lang$svg$Svg_Attributes$elevation = _elm_lang$virtual_dom$VirtualDom$attribute('elevation');
var _elm_lang$svg$Svg_Attributes$edgeMode = _elm_lang$virtual_dom$VirtualDom$attribute('edgeMode');
var _elm_lang$svg$Svg_Attributes$dy = _elm_lang$virtual_dom$VirtualDom$attribute('dy');
var _elm_lang$svg$Svg_Attributes$dx = _elm_lang$virtual_dom$VirtualDom$attribute('dx');
var _elm_lang$svg$Svg_Attributes$dur = _elm_lang$virtual_dom$VirtualDom$attribute('dur');
var _elm_lang$svg$Svg_Attributes$divisor = _elm_lang$virtual_dom$VirtualDom$attribute('divisor');
var _elm_lang$svg$Svg_Attributes$diffuseConstant = _elm_lang$virtual_dom$VirtualDom$attribute('diffuseConstant');
var _elm_lang$svg$Svg_Attributes$descent = _elm_lang$virtual_dom$VirtualDom$attribute('descent');
var _elm_lang$svg$Svg_Attributes$decelerate = _elm_lang$virtual_dom$VirtualDom$attribute('decelerate');
var _elm_lang$svg$Svg_Attributes$d = _elm_lang$virtual_dom$VirtualDom$attribute('d');
var _elm_lang$svg$Svg_Attributes$cy = _elm_lang$virtual_dom$VirtualDom$attribute('cy');
var _elm_lang$svg$Svg_Attributes$cx = _elm_lang$virtual_dom$VirtualDom$attribute('cx');
var _elm_lang$svg$Svg_Attributes$contentStyleType = _elm_lang$virtual_dom$VirtualDom$attribute('contentStyleType');
var _elm_lang$svg$Svg_Attributes$contentScriptType = _elm_lang$virtual_dom$VirtualDom$attribute('contentScriptType');
var _elm_lang$svg$Svg_Attributes$clipPathUnits = _elm_lang$virtual_dom$VirtualDom$attribute('clipPathUnits');
var _elm_lang$svg$Svg_Attributes$class = _elm_lang$virtual_dom$VirtualDom$attribute('class');
var _elm_lang$svg$Svg_Attributes$capHeight = _elm_lang$virtual_dom$VirtualDom$attribute('cap-height');
var _elm_lang$svg$Svg_Attributes$calcMode = _elm_lang$virtual_dom$VirtualDom$attribute('calcMode');
var _elm_lang$svg$Svg_Attributes$by = _elm_lang$virtual_dom$VirtualDom$attribute('by');
var _elm_lang$svg$Svg_Attributes$bias = _elm_lang$virtual_dom$VirtualDom$attribute('bias');
var _elm_lang$svg$Svg_Attributes$begin = _elm_lang$virtual_dom$VirtualDom$attribute('begin');
var _elm_lang$svg$Svg_Attributes$bbox = _elm_lang$virtual_dom$VirtualDom$attribute('bbox');
var _elm_lang$svg$Svg_Attributes$baseProfile = _elm_lang$virtual_dom$VirtualDom$attribute('baseProfile');
var _elm_lang$svg$Svg_Attributes$baseFrequency = _elm_lang$virtual_dom$VirtualDom$attribute('baseFrequency');
var _elm_lang$svg$Svg_Attributes$azimuth = _elm_lang$virtual_dom$VirtualDom$attribute('azimuth');
var _elm_lang$svg$Svg_Attributes$autoReverse = _elm_lang$virtual_dom$VirtualDom$attribute('autoReverse');
var _elm_lang$svg$Svg_Attributes$attributeType = _elm_lang$virtual_dom$VirtualDom$attribute('attributeType');
var _elm_lang$svg$Svg_Attributes$attributeName = _elm_lang$virtual_dom$VirtualDom$attribute('attributeName');
var _elm_lang$svg$Svg_Attributes$ascent = _elm_lang$virtual_dom$VirtualDom$attribute('ascent');
var _elm_lang$svg$Svg_Attributes$arabicForm = _elm_lang$virtual_dom$VirtualDom$attribute('arabic-form');
var _elm_lang$svg$Svg_Attributes$amplitude = _elm_lang$virtual_dom$VirtualDom$attribute('amplitude');
var _elm_lang$svg$Svg_Attributes$allowReorder = _elm_lang$virtual_dom$VirtualDom$attribute('allowReorder');
var _elm_lang$svg$Svg_Attributes$alphabetic = _elm_lang$virtual_dom$VirtualDom$attribute('alphabetic');
var _elm_lang$svg$Svg_Attributes$additive = _elm_lang$virtual_dom$VirtualDom$attribute('additive');
var _elm_lang$svg$Svg_Attributes$accumulate = _elm_lang$virtual_dom$VirtualDom$attribute('accumulate');
var _elm_lang$svg$Svg_Attributes$accelerate = _elm_lang$virtual_dom$VirtualDom$attribute('accelerate');
var _elm_lang$svg$Svg_Attributes$accentHeight = _elm_lang$virtual_dom$VirtualDom$attribute('accent-height');

var _elm_lang$websocket$Native_WebSocket = function() {

function open(url, settings)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		try
		{
			var socket = new WebSocket(url);
			socket.elm_web_socket = true;
		}
		catch(err)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail({
				ctor: err.name === 'SecurityError' ? 'BadSecurity' : 'BadArgs',
				_0: err.message
			}));
		}

		socket.addEventListener("open", function(event) {
			callback(_elm_lang$core$Native_Scheduler.succeed(socket));
		});

		socket.addEventListener("message", function(event) {
			_elm_lang$core$Native_Scheduler.rawSpawn(A2(settings.onMessage, socket, event.data));
		});

		socket.addEventListener("close", function(event) {
			_elm_lang$core$Native_Scheduler.rawSpawn(settings.onClose({
				code: event.code,
				reason: event.reason,
				wasClean: event.wasClean
			}));
		});

		return function()
		{
			if (socket && socket.close)
			{
				socket.close();
			}
		};
	});
}

function send(socket, string)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var result =
			socket.readyState === WebSocket.OPEN
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just({ ctor: 'NotOpen' });

		try
		{
			socket.send(string);
		}
		catch(err)
		{
			result = _elm_lang$core$Maybe$Just({ ctor: 'BadString' });
		}

		callback(_elm_lang$core$Native_Scheduler.succeed(result));
	});
}

function close(code, reason, socket)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		try
		{
			socket.close(code, reason);
		}
		catch(err)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail(_elm_lang$core$Maybe$Just({
				ctor: err.name === 'SyntaxError' ? 'BadReason' : 'BadCode'
			})));
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Maybe$Nothing));
	});
}

function bytesQueued(socket)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		callback(_elm_lang$core$Native_Scheduler.succeed(socket.bufferedAmount));
	});
}

return {
	open: F2(open),
	send: F2(send),
	close: F3(close),
	bytesQueued: bytesQueued
};

}();

var _elm_lang$websocket$WebSocket_LowLevel$bytesQueued = _elm_lang$websocket$Native_WebSocket.bytesQueued;
var _elm_lang$websocket$WebSocket_LowLevel$send = _elm_lang$websocket$Native_WebSocket.send;
var _elm_lang$websocket$WebSocket_LowLevel$closeWith = _elm_lang$websocket$Native_WebSocket.close;
var _elm_lang$websocket$WebSocket_LowLevel$close = function (socket) {
	return A2(
		_elm_lang$core$Task$map,
		_elm_lang$core$Basics$always(
			{ctor: '_Tuple0'}),
		A3(_elm_lang$websocket$WebSocket_LowLevel$closeWith, 1000, '', socket));
};
var _elm_lang$websocket$WebSocket_LowLevel$open = _elm_lang$websocket$Native_WebSocket.open;
var _elm_lang$websocket$WebSocket_LowLevel$Settings = F2(
	function (a, b) {
		return {onMessage: a, onClose: b};
	});
var _elm_lang$websocket$WebSocket_LowLevel$WebSocket = {ctor: 'WebSocket'};
var _elm_lang$websocket$WebSocket_LowLevel$BadArgs = {ctor: 'BadArgs'};
var _elm_lang$websocket$WebSocket_LowLevel$BadSecurity = {ctor: 'BadSecurity'};
var _elm_lang$websocket$WebSocket_LowLevel$BadReason = {ctor: 'BadReason'};
var _elm_lang$websocket$WebSocket_LowLevel$BadCode = {ctor: 'BadCode'};
var _elm_lang$websocket$WebSocket_LowLevel$BadString = {ctor: 'BadString'};
var _elm_lang$websocket$WebSocket_LowLevel$NotOpen = {ctor: 'NotOpen'};

var _elm_lang$websocket$WebSocket$closeConnection = function (connection) {
	var _p0 = connection;
	if (_p0.ctor === 'Opening') {
		return _elm_lang$core$Process$kill(_p0._1);
	} else {
		return _elm_lang$websocket$WebSocket_LowLevel$close(_p0._0);
	}
};
var _elm_lang$websocket$WebSocket$after = function (backoff) {
	return (_elm_lang$core$Native_Utils.cmp(backoff, 1) < 0) ? _elm_lang$core$Task$succeed(
		{ctor: '_Tuple0'}) : _elm_lang$core$Process$sleep(
		_elm_lang$core$Basics$toFloat(
			10 * Math.pow(2, backoff)));
};
var _elm_lang$websocket$WebSocket$removeQueue = F2(
	function (name, state) {
		return _elm_lang$core$Native_Utils.update(
			state,
			{
				queues: A2(_elm_lang$core$Dict$remove, name, state.queues)
			});
	});
var _elm_lang$websocket$WebSocket$updateSocket = F3(
	function (name, connection, state) {
		return _elm_lang$core$Native_Utils.update(
			state,
			{
				sockets: A3(_elm_lang$core$Dict$insert, name, connection, state.sockets)
			});
	});
var _elm_lang$websocket$WebSocket$add = F2(
	function (value, maybeList) {
		var _p1 = maybeList;
		if (_p1.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p1._0});
		}
	});
var _elm_lang$websocket$WebSocket$buildSubDict = F2(
	function (subs, dict) {
		buildSubDict:
		while (true) {
			var _p2 = subs;
			if (_p2.ctor === '[]') {
				return dict;
			} else {
				if (_p2._0.ctor === 'Listen') {
					var _v3 = _p2._1,
						_v4 = A3(
						_elm_lang$core$Dict$update,
						_p2._0._0,
						_elm_lang$websocket$WebSocket$add(_p2._0._1),
						dict);
					subs = _v3;
					dict = _v4;
					continue buildSubDict;
				} else {
					var _v5 = _p2._1,
						_v6 = A3(
						_elm_lang$core$Dict$update,
						_p2._0._0,
						function (_p3) {
							return _elm_lang$core$Maybe$Just(
								A2(
									_elm_lang$core$Maybe$withDefault,
									{ctor: '[]'},
									_p3));
						},
						dict);
					subs = _v5;
					dict = _v6;
					continue buildSubDict;
				}
			}
		}
	});
var _elm_lang$websocket$WebSocket_ops = _elm_lang$websocket$WebSocket_ops || {};
_elm_lang$websocket$WebSocket_ops['&>'] = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p4) {
				return t2;
			},
			t1);
	});
var _elm_lang$websocket$WebSocket$sendMessagesHelp = F3(
	function (cmds, socketsDict, queuesDict) {
		sendMessagesHelp:
		while (true) {
			var _p5 = cmds;
			if (_p5.ctor === '[]') {
				return _elm_lang$core$Task$succeed(queuesDict);
			} else {
				var _p9 = _p5._1;
				var _p8 = _p5._0._0;
				var _p7 = _p5._0._1;
				var _p6 = A2(_elm_lang$core$Dict$get, _p8, socketsDict);
				if ((_p6.ctor === 'Just') && (_p6._0.ctor === 'Connected')) {
					return A2(
						_elm_lang$websocket$WebSocket_ops['&>'],
						A2(_elm_lang$websocket$WebSocket_LowLevel$send, _p6._0._0, _p7),
						A3(_elm_lang$websocket$WebSocket$sendMessagesHelp, _p9, socketsDict, queuesDict));
				} else {
					var _v9 = _p9,
						_v10 = socketsDict,
						_v11 = A3(
						_elm_lang$core$Dict$update,
						_p8,
						_elm_lang$websocket$WebSocket$add(_p7),
						queuesDict);
					cmds = _v9;
					socketsDict = _v10;
					queuesDict = _v11;
					continue sendMessagesHelp;
				}
			}
		}
	});
var _elm_lang$websocket$WebSocket$subscription = _elm_lang$core$Native_Platform.leaf('WebSocket');
var _elm_lang$websocket$WebSocket$command = _elm_lang$core$Native_Platform.leaf('WebSocket');
var _elm_lang$websocket$WebSocket$State = F3(
	function (a, b, c) {
		return {sockets: a, queues: b, subs: c};
	});
var _elm_lang$websocket$WebSocket$init = _elm_lang$core$Task$succeed(
	A3(_elm_lang$websocket$WebSocket$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$websocket$WebSocket$Send = F2(
	function (a, b) {
		return {ctor: 'Send', _0: a, _1: b};
	});
var _elm_lang$websocket$WebSocket$send = F2(
	function (url, message) {
		return _elm_lang$websocket$WebSocket$command(
			A2(_elm_lang$websocket$WebSocket$Send, url, message));
	});
var _elm_lang$websocket$WebSocket$cmdMap = F2(
	function (_p11, _p10) {
		var _p12 = _p10;
		return A2(_elm_lang$websocket$WebSocket$Send, _p12._0, _p12._1);
	});
var _elm_lang$websocket$WebSocket$KeepAlive = function (a) {
	return {ctor: 'KeepAlive', _0: a};
};
var _elm_lang$websocket$WebSocket$keepAlive = function (url) {
	return _elm_lang$websocket$WebSocket$subscription(
		_elm_lang$websocket$WebSocket$KeepAlive(url));
};
var _elm_lang$websocket$WebSocket$Listen = F2(
	function (a, b) {
		return {ctor: 'Listen', _0: a, _1: b};
	});
var _elm_lang$websocket$WebSocket$listen = F2(
	function (url, tagger) {
		return _elm_lang$websocket$WebSocket$subscription(
			A2(_elm_lang$websocket$WebSocket$Listen, url, tagger));
	});
var _elm_lang$websocket$WebSocket$subMap = F2(
	function (func, sub) {
		var _p13 = sub;
		if (_p13.ctor === 'Listen') {
			return A2(
				_elm_lang$websocket$WebSocket$Listen,
				_p13._0,
				function (_p14) {
					return func(
						_p13._1(_p14));
				});
		} else {
			return _elm_lang$websocket$WebSocket$KeepAlive(_p13._0);
		}
	});
var _elm_lang$websocket$WebSocket$Connected = function (a) {
	return {ctor: 'Connected', _0: a};
};
var _elm_lang$websocket$WebSocket$Opening = F2(
	function (a, b) {
		return {ctor: 'Opening', _0: a, _1: b};
	});
var _elm_lang$websocket$WebSocket$BadOpen = function (a) {
	return {ctor: 'BadOpen', _0: a};
};
var _elm_lang$websocket$WebSocket$GoodOpen = F2(
	function (a, b) {
		return {ctor: 'GoodOpen', _0: a, _1: b};
	});
var _elm_lang$websocket$WebSocket$Die = function (a) {
	return {ctor: 'Die', _0: a};
};
var _elm_lang$websocket$WebSocket$Receive = F2(
	function (a, b) {
		return {ctor: 'Receive', _0: a, _1: b};
	});
var _elm_lang$websocket$WebSocket$open = F2(
	function (name, router) {
		return A2(
			_elm_lang$websocket$WebSocket_LowLevel$open,
			name,
			{
				onMessage: F2(
					function (_p15, msg) {
						return A2(
							_elm_lang$core$Platform$sendToSelf,
							router,
							A2(_elm_lang$websocket$WebSocket$Receive, name, msg));
					}),
				onClose: function (details) {
					return A2(
						_elm_lang$core$Platform$sendToSelf,
						router,
						_elm_lang$websocket$WebSocket$Die(name));
				}
			});
	});
var _elm_lang$websocket$WebSocket$attemptOpen = F3(
	function (router, backoff, name) {
		var badOpen = function (_p16) {
			return A2(
				_elm_lang$core$Platform$sendToSelf,
				router,
				_elm_lang$websocket$WebSocket$BadOpen(name));
		};
		var goodOpen = function (ws) {
			return A2(
				_elm_lang$core$Platform$sendToSelf,
				router,
				A2(_elm_lang$websocket$WebSocket$GoodOpen, name, ws));
		};
		var actuallyAttemptOpen = A2(
			_elm_lang$core$Task$onError,
			badOpen,
			A2(
				_elm_lang$core$Task$andThen,
				goodOpen,
				A2(_elm_lang$websocket$WebSocket$open, name, router)));
		return _elm_lang$core$Process$spawn(
			A2(
				_elm_lang$websocket$WebSocket_ops['&>'],
				_elm_lang$websocket$WebSocket$after(backoff),
				actuallyAttemptOpen));
	});
var _elm_lang$websocket$WebSocket$onEffects = F4(
	function (router, cmds, subs, state) {
		var newSubs = A2(_elm_lang$websocket$WebSocket$buildSubDict, subs, _elm_lang$core$Dict$empty);
		var cleanup = function (newQueues) {
			var rightStep = F3(
				function (name, connection, getNewSockets) {
					return A2(
						_elm_lang$websocket$WebSocket_ops['&>'],
						_elm_lang$websocket$WebSocket$closeConnection(connection),
						getNewSockets);
				});
			var bothStep = F4(
				function (name, _p17, connection, getNewSockets) {
					return A2(
						_elm_lang$core$Task$map,
						A2(_elm_lang$core$Dict$insert, name, connection),
						getNewSockets);
				});
			var leftStep = F3(
				function (name, _p18, getNewSockets) {
					return A2(
						_elm_lang$core$Task$andThen,
						function (newSockets) {
							return A2(
								_elm_lang$core$Task$andThen,
								function (pid) {
									return _elm_lang$core$Task$succeed(
										A3(
											_elm_lang$core$Dict$insert,
											name,
											A2(_elm_lang$websocket$WebSocket$Opening, 0, pid),
											newSockets));
								},
								A3(_elm_lang$websocket$WebSocket$attemptOpen, router, 0, name));
						},
						getNewSockets);
				});
			var newEntries = A2(
				_elm_lang$core$Dict$union,
				newQueues,
				A2(
					_elm_lang$core$Dict$map,
					F2(
						function (k, v) {
							return {ctor: '[]'};
						}),
					newSubs));
			var collectNewSockets = A6(
				_elm_lang$core$Dict$merge,
				leftStep,
				bothStep,
				rightStep,
				newEntries,
				state.sockets,
				_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
			return A2(
				_elm_lang$core$Task$andThen,
				function (newSockets) {
					return _elm_lang$core$Task$succeed(
						A3(_elm_lang$websocket$WebSocket$State, newSockets, newQueues, newSubs));
				},
				collectNewSockets);
		};
		var sendMessagesGetNewQueues = A3(_elm_lang$websocket$WebSocket$sendMessagesHelp, cmds, state.sockets, state.queues);
		return A2(_elm_lang$core$Task$andThen, cleanup, sendMessagesGetNewQueues);
	});
var _elm_lang$websocket$WebSocket$onSelfMsg = F3(
	function (router, selfMsg, state) {
		var _p19 = selfMsg;
		switch (_p19.ctor) {
			case 'Receive':
				var sends = A2(
					_elm_lang$core$List$map,
					function (tagger) {
						return A2(
							_elm_lang$core$Platform$sendToApp,
							router,
							tagger(_p19._1));
					},
					A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						A2(_elm_lang$core$Dict$get, _p19._0, state.subs)));
				return A2(
					_elm_lang$websocket$WebSocket_ops['&>'],
					_elm_lang$core$Task$sequence(sends),
					_elm_lang$core$Task$succeed(state));
			case 'Die':
				var _p21 = _p19._0;
				var _p20 = A2(_elm_lang$core$Dict$get, _p21, state.sockets);
				if (_p20.ctor === 'Nothing') {
					return _elm_lang$core$Task$succeed(state);
				} else {
					return A2(
						_elm_lang$core$Task$andThen,
						function (pid) {
							return _elm_lang$core$Task$succeed(
								A3(
									_elm_lang$websocket$WebSocket$updateSocket,
									_p21,
									A2(_elm_lang$websocket$WebSocket$Opening, 0, pid),
									state));
						},
						A3(_elm_lang$websocket$WebSocket$attemptOpen, router, 0, _p21));
				}
			case 'GoodOpen':
				var _p24 = _p19._1;
				var _p23 = _p19._0;
				var _p22 = A2(_elm_lang$core$Dict$get, _p23, state.queues);
				if (_p22.ctor === 'Nothing') {
					return _elm_lang$core$Task$succeed(
						A3(
							_elm_lang$websocket$WebSocket$updateSocket,
							_p23,
							_elm_lang$websocket$WebSocket$Connected(_p24),
							state));
				} else {
					return A3(
						_elm_lang$core$List$foldl,
						F2(
							function (msg, task) {
								return A2(
									_elm_lang$websocket$WebSocket_ops['&>'],
									A2(_elm_lang$websocket$WebSocket_LowLevel$send, _p24, msg),
									task);
							}),
						_elm_lang$core$Task$succeed(
							A2(
								_elm_lang$websocket$WebSocket$removeQueue,
								_p23,
								A3(
									_elm_lang$websocket$WebSocket$updateSocket,
									_p23,
									_elm_lang$websocket$WebSocket$Connected(_p24),
									state))),
						_p22._0);
				}
			default:
				var _p27 = _p19._0;
				var _p25 = A2(_elm_lang$core$Dict$get, _p27, state.sockets);
				if (_p25.ctor === 'Nothing') {
					return _elm_lang$core$Task$succeed(state);
				} else {
					if (_p25._0.ctor === 'Opening') {
						var _p26 = _p25._0._0;
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$websocket$WebSocket$updateSocket,
										_p27,
										A2(_elm_lang$websocket$WebSocket$Opening, _p26 + 1, pid),
										state));
							},
							A3(_elm_lang$websocket$WebSocket$attemptOpen, router, _p26 + 1, _p27));
					} else {
						return _elm_lang$core$Task$succeed(state);
					}
				}
		}
	});
_elm_lang$core$Native_Platform.effectManagers['WebSocket'] = {pkg: 'elm-lang/websocket', init: _elm_lang$websocket$WebSocket$init, onEffects: _elm_lang$websocket$WebSocket$onEffects, onSelfMsg: _elm_lang$websocket$WebSocket$onSelfMsg, tag: 'fx', cmdMap: _elm_lang$websocket$WebSocket$cmdMap, subMap: _elm_lang$websocket$WebSocket$subMap};

var _fbonetti$elm_phoenix_socket$Phoenix_Helpers$emptyPayload = _elm_lang$core$Json_Encode$object(
	{ctor: '[]'});
var _fbonetti$elm_phoenix_socket$Phoenix_Helpers$maybeInt = function (maybe) {
	var _p0 = maybe;
	if (_p0.ctor === 'Just') {
		return _elm_lang$core$Json_Encode$int(_p0._0);
	} else {
		return _elm_lang$core$Json_Encode$null;
	}
};
var _fbonetti$elm_phoenix_socket$Phoenix_Helpers$messageEncoder = function (_p1) {
	var _p2 = _p1;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'event',
				_1: _elm_lang$core$Json_Encode$string(_p2.event)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'topic',
					_1: _elm_lang$core$Json_Encode$string(_p2.topic)
				},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'payload', _1: _p2.payload},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'ref',
							_1: _fbonetti$elm_phoenix_socket$Phoenix_Helpers$maybeInt(_p2.ref)
						},
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _fbonetti$elm_phoenix_socket$Phoenix_Helpers$encodeMessage = function (_p3) {
	return A2(
		_elm_lang$core$Json_Encode$encode,
		0,
		_fbonetti$elm_phoenix_socket$Phoenix_Helpers$messageEncoder(_p3));
};
var _fbonetti$elm_phoenix_socket$Phoenix_Helpers$nullOrInt = _elm_lang$core$Json_Decode$oneOf(
	{
		ctor: '::',
		_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
		_1: {
			ctor: '::',
			_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$int),
			_1: {ctor: '[]'}
		}
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Helpers$Message = F4(
	function (a, b, c, d) {
		return {event: a, topic: b, payload: c, ref: d};
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Helpers$messageDecoder = A5(
	_elm_lang$core$Json_Decode$map4,
	_fbonetti$elm_phoenix_socket$Phoenix_Helpers$Message,
	A2(_elm_lang$core$Json_Decode$field, 'event', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'topic', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'payload', _elm_lang$core$Json_Decode$value),
	A2(_elm_lang$core$Json_Decode$field, 'ref', _fbonetti$elm_phoenix_socket$Phoenix_Helpers$nullOrInt));

var _fbonetti$elm_phoenix_socket$Phoenix_Channel$setState = F2(
	function (state, channel) {
		return _elm_lang$core$Native_Utils.update(
			channel,
			{state: state});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$onJoinError = F2(
	function (valueToMsg, channel) {
		return _elm_lang$core$Native_Utils.update(
			channel,
			{
				onJoinError: _elm_lang$core$Maybe$Just(valueToMsg)
			});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$onJoin = F2(
	function (valueToMsg, channel) {
		return _elm_lang$core$Native_Utils.update(
			channel,
			{
				onJoin: _elm_lang$core$Maybe$Just(valueToMsg)
			});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$onClose = F2(
	function (valueToMsg, channel) {
		return _elm_lang$core$Native_Utils.update(
			channel,
			{
				onClose: _elm_lang$core$Maybe$Just(valueToMsg)
			});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$onError = F2(
	function (valueToMsg, channel) {
		return _elm_lang$core$Native_Utils.update(
			channel,
			{
				onError: _elm_lang$core$Maybe$Just(valueToMsg)
			});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$withPayload = F2(
	function (payload, channel) {
		return _elm_lang$core$Native_Utils.update(
			channel,
			{payload: payload});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$Channel = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {name: a, payload: b, state: c, onClose: d, onError: e, onJoin: f, onJoinError: g, joinRef: h, leaveRef: i};
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$Leaving = {ctor: 'Leaving'};
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$Joining = {ctor: 'Joining'};
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$Joined = {ctor: 'Joined'};
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$Errored = {ctor: 'Errored'};
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$Closed = {ctor: 'Closed'};
var _fbonetti$elm_phoenix_socket$Phoenix_Channel$init = function (name) {
	return {name: name, payload: _fbonetti$elm_phoenix_socket$Phoenix_Helpers$emptyPayload, state: _fbonetti$elm_phoenix_socket$Phoenix_Channel$Closed, onClose: _elm_lang$core$Maybe$Nothing, onError: _elm_lang$core$Maybe$Nothing, onJoin: _elm_lang$core$Maybe$Nothing, onJoinError: _elm_lang$core$Maybe$Nothing, joinRef: -1, leaveRef: -1};
};

var _fbonetti$elm_phoenix_socket$Phoenix_Push$onError = F2(
	function (valueToMsg, push) {
		return _elm_lang$core$Native_Utils.update(
			push,
			{
				onError: _elm_lang$core$Maybe$Just(valueToMsg)
			});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Push$onOk = F2(
	function (valueToMsg, push) {
		return _elm_lang$core$Native_Utils.update(
			push,
			{
				onOk: _elm_lang$core$Maybe$Just(valueToMsg)
			});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Push$withPayload = F2(
	function (payload, push) {
		return _elm_lang$core$Native_Utils.update(
			push,
			{payload: payload});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Push$Push = F5(
	function (a, b, c, d, e) {
		return {event: a, channel: b, payload: c, onOk: d, onError: e};
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Push$init = F2(
	function (event, channel) {
		return A5(_fbonetti$elm_phoenix_socket$Phoenix_Push$Push, event, channel, _fbonetti$elm_phoenix_socket$Phoenix_Helpers$emptyPayload, _elm_lang$core$Maybe$Nothing, _elm_lang$core$Maybe$Nothing);
	});

var _fbonetti$elm_phoenix_socket$Phoenix_Socket$replyDecoder = A3(
	_elm_lang$core$Json_Decode$map2,
	F2(
		function (v0, v1) {
			return {ctor: '_Tuple2', _0: v0, _1: v1};
		}),
	A2(_elm_lang$core$Json_Decode$field, 'status', _elm_lang$core$Json_Decode$string),
	A2(_elm_lang$core$Json_Decode$field, 'response', _elm_lang$core$Json_Decode$value));
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$decodeMessage = function (_p0) {
	return _elm_lang$core$Result$toMaybe(
		A2(_elm_lang$core$Json_Decode$decodeString, _fbonetti$elm_phoenix_socket$Phoenix_Helpers$messageDecoder, _p0));
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$debugIfEnabled = function (socket) {
	return socket.debug ? _elm_lang$core$Debug$log('phx_message') : _elm_lang$core$Basics$identity;
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$phoenixMessages = function (socket) {
	return A2(_elm_lang$websocket$WebSocket$listen, socket.path, _fbonetti$elm_phoenix_socket$Phoenix_Socket$decodeMessage);
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$mapAll = F2(
	function (fn, internalMsg) {
		var _p1 = internalMsg;
		if (_p1.ctor === 'ExternalMsg') {
			return _p1._0;
		} else {
			return fn(internalMsg);
		}
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$sendMessage = F2(
	function (path, message) {
		return A2(
			_elm_lang$websocket$WebSocket$send,
			path,
			_fbonetti$elm_phoenix_socket$Phoenix_Helpers$encodeMessage(message));
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$send = F4(
	function (_p2, event, channel, payload) {
		var _p3 = _p2;
		return A2(
			_fbonetti$elm_phoenix_socket$Phoenix_Socket$sendMessage,
			_p3.path,
			A4(
				_fbonetti$elm_phoenix_socket$Phoenix_Helpers$Message,
				event,
				channel,
				payload,
				_elm_lang$core$Maybe$Just(_p3.ref)));
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$off = F3(
	function (eventName, channelName, socket) {
		return _elm_lang$core$Native_Utils.update(
			socket,
			{
				events: A2(
					_elm_lang$core$Dict$remove,
					{ctor: '_Tuple2', _0: eventName, _1: channelName},
					socket.events)
			});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$on = F4(
	function (eventName, channelName, onReceive, socket) {
		return _elm_lang$core$Native_Utils.update(
			socket,
			{
				events: A3(
					_elm_lang$core$Dict$insert,
					{ctor: '_Tuple2', _0: eventName, _1: channelName},
					onReceive,
					socket.events)
			});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$push = F2(
	function (push_, socket) {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				socket,
				{
					pushes: A3(_elm_lang$core$Dict$insert, socket.ref, push_, socket.pushes),
					ref: socket.ref + 1
				}),
			_1: A4(_fbonetti$elm_phoenix_socket$Phoenix_Socket$send, socket, push_.event, push_.channel, push_.payload)
		};
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$heartbeat = function (socket) {
	var push_ = A2(_fbonetti$elm_phoenix_socket$Phoenix_Push$init, 'heartbeat', 'phoenix');
	return A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$push, push_, socket);
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$leave = F2(
	function (channelName, socket) {
		var _p4 = A2(_elm_lang$core$Dict$get, channelName, socket.channels);
		if (_p4.ctor === 'Just') {
			var _p5 = _p4._0;
			if (_elm_lang$core$Native_Utils.eq(_p5.state, _fbonetti$elm_phoenix_socket$Phoenix_Channel$Joining) || _elm_lang$core$Native_Utils.eq(_p5.state, _fbonetti$elm_phoenix_socket$Phoenix_Channel$Joined)) {
				var channel_ = _elm_lang$core$Native_Utils.update(
					_p5,
					{state: _fbonetti$elm_phoenix_socket$Phoenix_Channel$Leaving, leaveRef: socket.ref});
				var socket_ = _elm_lang$core$Native_Utils.update(
					socket,
					{
						channels: A3(_elm_lang$core$Dict$insert, channelName, channel_, socket.channels)
					});
				var push_ = A2(_fbonetti$elm_phoenix_socket$Phoenix_Push$init, 'phx_leave', _p5.name);
				return A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$push, push_, socket_);
			} else {
				return {ctor: '_Tuple2', _0: socket, _1: _elm_lang$core$Platform_Cmd$none};
			}
		} else {
			return {ctor: '_Tuple2', _0: socket, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$joinChannel = F2(
	function (channel, socket) {
		var channel_ = _elm_lang$core$Native_Utils.update(
			channel,
			{state: _fbonetti$elm_phoenix_socket$Phoenix_Channel$Joining, joinRef: socket.ref});
		var socket_ = _elm_lang$core$Native_Utils.update(
			socket,
			{
				channels: A3(_elm_lang$core$Dict$insert, channel.name, channel_, socket.channels)
			});
		var push_ = A5(_fbonetti$elm_phoenix_socket$Phoenix_Push$Push, 'phx_join', channel.name, channel.payload, channel.onJoin, channel.onError);
		return A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$push, push_, socket_);
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$join = F2(
	function (channel, socket) {
		var _p6 = A2(_elm_lang$core$Dict$get, channel.name, socket.channels);
		if (_p6.ctor === 'Just') {
			var _p7 = _p6._0.state;
			return (_elm_lang$core$Native_Utils.eq(_p7, _fbonetti$elm_phoenix_socket$Phoenix_Channel$Joined) || _elm_lang$core$Native_Utils.eq(_p7, _fbonetti$elm_phoenix_socket$Phoenix_Channel$Joining)) ? {ctor: '_Tuple2', _0: socket, _1: _elm_lang$core$Platform_Cmd$none} : A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$joinChannel, channel, socket);
		} else {
			return A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$joinChannel, channel, socket);
		}
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$withoutHeartbeat = function (socket) {
	return _elm_lang$core$Native_Utils.update(
		socket,
		{withoutHeartbeat: true});
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$withHeartbeatInterval = F2(
	function (intervalSeconds, socket) {
		return _elm_lang$core$Native_Utils.update(
			socket,
			{heartbeatIntervalSeconds: intervalSeconds});
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$withDebug = function (socket) {
	return _elm_lang$core$Native_Utils.update(
		socket,
		{debug: true});
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$update = F2(
	function (msg, socket) {
		var _p8 = msg;
		switch (_p8.ctor) {
			case 'ChannelErrored':
				var channels = A3(
					_elm_lang$core$Dict$update,
					_p8._0,
					_elm_lang$core$Maybe$map(
						_fbonetti$elm_phoenix_socket$Phoenix_Channel$setState(_fbonetti$elm_phoenix_socket$Phoenix_Channel$Errored)),
					socket.channels);
				var socket_ = _elm_lang$core$Native_Utils.update(
					socket,
					{channels: channels});
				return {ctor: '_Tuple2', _0: socket_, _1: _elm_lang$core$Platform_Cmd$none};
			case 'ChannelClosed':
				var _p11 = _p8._0;
				var _p9 = A2(_elm_lang$core$Dict$get, _p11, socket.channels);
				if (_p9.ctor === 'Just') {
					var _p10 = _p9._0;
					var pushes = A2(_elm_lang$core$Dict$remove, _p10.joinRef, socket.pushes);
					var channels = A3(
						_elm_lang$core$Dict$insert,
						_p11,
						A2(_fbonetti$elm_phoenix_socket$Phoenix_Channel$setState, _fbonetti$elm_phoenix_socket$Phoenix_Channel$Closed, _p10),
						socket.channels);
					var socket_ = _elm_lang$core$Native_Utils.update(
						socket,
						{channels: channels, pushes: pushes});
					return {ctor: '_Tuple2', _0: socket_, _1: _elm_lang$core$Platform_Cmd$none};
				} else {
					return {ctor: '_Tuple2', _0: socket, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'ChannelJoined':
				var _p14 = _p8._0;
				var _p12 = A2(_elm_lang$core$Dict$get, _p14, socket.channels);
				if (_p12.ctor === 'Just') {
					var _p13 = _p12._0;
					var pushes = A2(_elm_lang$core$Dict$remove, _p13.joinRef, socket.pushes);
					var channels = A3(
						_elm_lang$core$Dict$insert,
						_p14,
						A2(_fbonetti$elm_phoenix_socket$Phoenix_Channel$setState, _fbonetti$elm_phoenix_socket$Phoenix_Channel$Joined, _p13),
						socket.channels);
					var socket_ = _elm_lang$core$Native_Utils.update(
						socket,
						{channels: channels, pushes: pushes});
					return {ctor: '_Tuple2', _0: socket_, _1: _elm_lang$core$Platform_Cmd$none};
				} else {
					return {ctor: '_Tuple2', _0: socket, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'Heartbeat':
				return _fbonetti$elm_phoenix_socket$Phoenix_Socket$heartbeat(socket);
			default:
				return {ctor: '_Tuple2', _0: socket, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$init = function (path) {
	return {
		path: path,
		debug: false,
		channels: _elm_lang$core$Dict$fromList(
			{ctor: '[]'}),
		events: _elm_lang$core$Dict$fromList(
			{ctor: '[]'}),
		pushes: _elm_lang$core$Dict$fromList(
			{ctor: '[]'}),
		ref: 0,
		heartbeatIntervalSeconds: 30,
		withoutHeartbeat: false
	};
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$Socket = F8(
	function (a, b, c, d, e, f, g, h) {
		return {path: a, debug: b, channels: c, events: d, pushes: e, ref: f, heartbeatIntervalSeconds: g, withoutHeartbeat: h};
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$Heartbeat = function (a) {
	return {ctor: 'Heartbeat', _0: a};
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$heartbeatSubscription = function (socket) {
	return socket.withoutHeartbeat ? _elm_lang$core$Platform_Sub$none : A2(_elm_lang$core$Time$every, _elm_lang$core$Time$second * socket.heartbeatIntervalSeconds, _fbonetti$elm_phoenix_socket$Phoenix_Socket$Heartbeat);
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$ReceiveReply = F2(
	function (a, b) {
		return {ctor: 'ReceiveReply', _0: a, _1: b};
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$ChannelJoined = function (a) {
	return {ctor: 'ChannelJoined', _0: a};
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$ChannelClosed = function (a) {
	return {ctor: 'ChannelClosed', _0: a};
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$ChannelErrored = function (a) {
	return {ctor: 'ChannelErrored', _0: a};
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$ExternalMsg = function (a) {
	return {ctor: 'ExternalMsg', _0: a};
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp = {ctor: 'NoOp'};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$handleInternalPhxReply = F2(
	function (socket, message) {
		var msg = A2(
			_elm_lang$core$Maybe$andThen,
			function (_p15) {
				var _p16 = _p15;
				return A2(
					_elm_lang$core$Maybe$andThen,
					function (ref) {
						return A2(
							_elm_lang$core$Maybe$andThen,
							function (channel) {
								return _elm_lang$core$Native_Utils.eq(_p16._0, 'ok') ? (_elm_lang$core$Native_Utils.eq(ref, channel.joinRef) ? _elm_lang$core$Maybe$Just(
									_fbonetti$elm_phoenix_socket$Phoenix_Socket$ChannelJoined(message.topic)) : (_elm_lang$core$Native_Utils.eq(ref, channel.leaveRef) ? _elm_lang$core$Maybe$Just(
									_fbonetti$elm_phoenix_socket$Phoenix_Socket$ChannelClosed(message.topic)) : _elm_lang$core$Maybe$Nothing)) : _elm_lang$core$Maybe$Nothing;
							},
							A2(_elm_lang$core$Dict$get, message.topic, socket.channels));
					},
					message.ref);
			},
			_elm_lang$core$Result$toMaybe(
				A2(_elm_lang$core$Json_Decode$decodeValue, _fbonetti$elm_phoenix_socket$Phoenix_Socket$replyDecoder, message.payload)));
		return A2(_elm_lang$core$Maybe$withDefault, _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp, msg);
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$mapInternalMsgs = F2(
	function (socket, maybeMessage) {
		var _p17 = maybeMessage;
		if (_p17.ctor === 'Just') {
			var _p19 = _p17._0;
			var message = socket.debug ? A2(_elm_lang$core$Debug$log, 'Phoenix message', _p19) : _p19;
			var _p18 = message.event;
			switch (_p18) {
				case 'phx_reply':
					return A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$handleInternalPhxReply, socket, message);
				case 'phx_error':
					return _fbonetti$elm_phoenix_socket$Phoenix_Socket$ChannelErrored(message.topic);
				case 'phx_close':
					return _fbonetti$elm_phoenix_socket$Phoenix_Socket$ChannelClosed(message.topic);
				default:
					return _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp;
			}
		} else {
			return _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp;
		}
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$internalMsgs = function (socket) {
	return A2(
		_elm_lang$core$Platform_Sub$map,
		_fbonetti$elm_phoenix_socket$Phoenix_Socket$mapInternalMsgs(socket),
		_fbonetti$elm_phoenix_socket$Phoenix_Socket$phoenixMessages(socket));
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$handlePhxReply = F2(
	function (socket, message) {
		var msg = A2(
			_elm_lang$core$Maybe$andThen,
			function (_p20) {
				var _p21 = _p20;
				var _p25 = _p21._1;
				return A2(
					_elm_lang$core$Maybe$andThen,
					function (ref) {
						return A2(
							_elm_lang$core$Maybe$andThen,
							function (push) {
								var _p22 = _p21._0;
								switch (_p22) {
									case 'ok':
										return A2(
											_elm_lang$core$Maybe$map,
											function (f) {
												return function (_p23) {
													return _fbonetti$elm_phoenix_socket$Phoenix_Socket$ExternalMsg(
														f(_p23));
												}(_p25);
											},
											push.onOk);
									case 'error':
										return A2(
											_elm_lang$core$Maybe$map,
											function (f) {
												return function (_p24) {
													return _fbonetti$elm_phoenix_socket$Phoenix_Socket$ExternalMsg(
														f(_p24));
												}(_p25);
											},
											push.onError);
									default:
										return _elm_lang$core$Maybe$Nothing;
								}
							},
							A2(_elm_lang$core$Dict$get, ref, socket.pushes));
					},
					message.ref);
			},
			_elm_lang$core$Result$toMaybe(
				A2(_elm_lang$core$Json_Decode$decodeValue, _fbonetti$elm_phoenix_socket$Phoenix_Socket$replyDecoder, message.payload)));
		return A2(_elm_lang$core$Maybe$withDefault, _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp, msg);
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$handleEvent = F2(
	function (socket, message) {
		var _p26 = A2(
			_elm_lang$core$Dict$get,
			{ctor: '_Tuple2', _0: message.event, _1: message.topic},
			socket.events);
		if (_p26.ctor === 'Just') {
			return _fbonetti$elm_phoenix_socket$Phoenix_Socket$ExternalMsg(
				_p26._0(message.payload));
		} else {
			return _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp;
		}
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$mapExternalMsgs = F2(
	function (socket, maybeMessage) {
		var _p27 = maybeMessage;
		if (_p27.ctor === 'Just') {
			var _p31 = _p27._0;
			var _p28 = _p31.event;
			switch (_p28) {
				case 'phx_reply':
					return A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$handlePhxReply, socket, _p31);
				case 'phx_error':
					var channel = A2(_elm_lang$core$Dict$get, _p31.topic, socket.channels);
					var onError = A2(
						_elm_lang$core$Maybe$andThen,
						function (_) {
							return _.onError;
						},
						channel);
					var msg = A2(
						_elm_lang$core$Maybe$map,
						function (f) {
							return function (_p29) {
								return _fbonetti$elm_phoenix_socket$Phoenix_Socket$ExternalMsg(
									f(_p29));
							}(_p31.payload);
						},
						onError);
					return A2(_elm_lang$core$Maybe$withDefault, _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp, msg);
				case 'phx_close':
					var channel = A2(_elm_lang$core$Dict$get, _p31.topic, socket.channels);
					var onClose = A2(
						_elm_lang$core$Maybe$andThen,
						function (_) {
							return _.onClose;
						},
						channel);
					var msg = A2(
						_elm_lang$core$Maybe$map,
						function (f) {
							return function (_p30) {
								return _fbonetti$elm_phoenix_socket$Phoenix_Socket$ExternalMsg(
									f(_p30));
							}(_p31.payload);
						},
						onClose);
					return A2(_elm_lang$core$Maybe$withDefault, _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp, msg);
				default:
					return A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$handleEvent, socket, _p31);
			}
		} else {
			return _fbonetti$elm_phoenix_socket$Phoenix_Socket$NoOp;
		}
	});
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$externalMsgs = function (socket) {
	return A2(
		_elm_lang$core$Platform_Sub$map,
		_fbonetti$elm_phoenix_socket$Phoenix_Socket$mapExternalMsgs(socket),
		_fbonetti$elm_phoenix_socket$Phoenix_Socket$phoenixMessages(socket));
};
var _fbonetti$elm_phoenix_socket$Phoenix_Socket$listen = F2(
	function (socket, fn) {
		return function (_p32) {
			return A2(
				_elm_lang$core$Platform_Sub$map,
				_fbonetti$elm_phoenix_socket$Phoenix_Socket$mapAll(fn),
				_elm_lang$core$Platform_Sub$batch(_p32));
		}(
			{
				ctor: '::',
				_0: _fbonetti$elm_phoenix_socket$Phoenix_Socket$internalMsgs(socket),
				_1: {
					ctor: '::',
					_0: _fbonetti$elm_phoenix_socket$Phoenix_Socket$externalMsgs(socket),
					_1: {
						ctor: '::',
						_0: _fbonetti$elm_phoenix_socket$Phoenix_Socket$heartbeatSubscription(socket),
						_1: {ctor: '[]'}
					}
				}
			});
	});

var _gampleman$elm_visualization$Visualization_List$extentWith = F2(
	function (fn, list) {
		var max = F2(
			function (a, b) {
				return (_elm_lang$core$Native_Utils.cmp(
					fn(a),
					fn(b)) > 0) ? a : b;
			});
		var min = F2(
			function (a, b) {
				return (_elm_lang$core$Native_Utils.cmp(
					fn(a),
					fn(b)) < 0) ? a : b;
			});
		var helper = F2(
			function (list, _p0) {
				helper:
				while (true) {
					var _p1 = _p0;
					var _p5 = _p1._0;
					var _p4 = _p1._1;
					var _p2 = list;
					if (_p2.ctor === '[]') {
						return {ctor: '_Tuple2', _0: _p5, _1: _p4};
					} else {
						var _p3 = _p2._0;
						var _v2 = _p2._1,
							_v3 = {
							ctor: '_Tuple2',
							_0: A2(min, _p5, _p3),
							_1: A2(max, _p4, _p3)
						};
						list = _v2;
						_p0 = _v3;
						continue helper;
					}
				}
			});
		var _p6 = list;
		if (_p6.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p7 = _p6._0;
			return _elm_lang$core$Maybe$Just(
				A2(
					helper,
					_p6._1,
					{ctor: '_Tuple2', _0: _p7, _1: _p7}));
		}
	});
var _gampleman$elm_visualization$Visualization_List$extent = _gampleman$elm_visualization$Visualization_List$extentWith(_elm_lang$core$Basics$identity);
var _gampleman$elm_visualization$Visualization_List$tickStep = F3(
	function (start, stop, count) {
		var step0 = _elm_lang$core$Basics$abs(stop - start) / A2(
			_elm_lang$core$Basics$max,
			0,
			_elm_lang$core$Basics$toFloat(count));
		var step1 = _elm_lang$core$Basics$toFloat(
			Math.pow(
				10,
				_elm_lang$core$Basics$floor(
					A2(_elm_lang$core$Basics$logBase, _elm_lang$core$Basics$e, step0) / A2(_elm_lang$core$Basics$logBase, _elm_lang$core$Basics$e, 10))));
		var error = step0 / step1;
		var step2 = (_elm_lang$core$Native_Utils.cmp(
			error,
			_elm_lang$core$Basics$sqrt(50)) > -1) ? (step1 * 10) : ((_elm_lang$core$Native_Utils.cmp(
			error,
			_elm_lang$core$Basics$sqrt(10)) > -1) ? (step1 * 5) : ((_elm_lang$core$Native_Utils.cmp(
			error,
			_elm_lang$core$Basics$sqrt(2)) > -1) ? (step1 * 2) : step1));
		return (_elm_lang$core$Native_Utils.cmp(stop, start) < 0) ? (0 - step2) : step2;
	});
var _gampleman$elm_visualization$Visualization_List$range = F3(
	function (start, stop, step) {
		var helper = F2(
			function (s, list) {
				helper:
				while (true) {
					var gt = function (n) {
						return _elm_lang$core$Native_Utils.cmp(n, 0) > 0;
					};
					if (gt((s + step) - stop)) {
						return A2(
							_elm_lang$core$Basics_ops['++'],
							list,
							{
								ctor: '::',
								_0: s,
								_1: {ctor: '[]'}
							});
					} else {
						var _v5 = s + step,
							_v6 = A2(
							_elm_lang$core$Basics_ops['++'],
							list,
							{
								ctor: '::',
								_0: s,
								_1: {ctor: '[]'}
							});
						s = _v5;
						list = _v6;
						continue helper;
					}
				}
			});
		return A2(
			helper,
			start,
			{ctor: '[]'});
	});
var _gampleman$elm_visualization$Visualization_List$ticks = F3(
	function (start, stop, count) {
		var step = A3(_gampleman$elm_visualization$Visualization_List$tickStep, start, stop, count);
		var beg = _elm_lang$core$Basics$toFloat(
			_elm_lang$core$Basics$ceiling(start / step)) * step;
		var end = (_elm_lang$core$Basics$toFloat(
			_elm_lang$core$Basics$floor(stop / step)) * step) + (step / 2);
		return A3(_gampleman$elm_visualization$Visualization_List$range, beg, end, step);
	});

var _gampleman$elm_visualization$Visualization_Interpolate$interpolateFloat = F3(
	function (from, to, time) {
		return from + ((to - from) * time);
	});

var _gampleman$elm_visualization$Visualization_Scale_Internal$bimap = F4(
	function (_p1, _p0, deinterpolate, reinterpolate) {
		var _p2 = _p1;
		var _p9 = _p2._1;
		var _p8 = _p2._0;
		var _p3 = _p0;
		var _p7 = _p3._1;
		var _p6 = _p3._0;
		var _p4 = (_elm_lang$core$Native_Utils.cmp(_p9, _p8) < 0) ? {
			ctor: '_Tuple2',
			_0: A2(deinterpolate, _p9, _p8),
			_1: A2(reinterpolate, _p7, _p6)
		} : {
			ctor: '_Tuple2',
			_0: A2(deinterpolate, _p8, _p9),
			_1: A2(reinterpolate, _p6, _p7)
		};
		var de = _p4._0;
		var re = _p4._1;
		return function (_p5) {
			return re(
				de(_p5));
		};
	});

var _gampleman$elm_visualization$Visualization_Scale_Linear$interpolate = _gampleman$elm_visualization$Visualization_Interpolate$interpolateFloat;
var _gampleman$elm_visualization$Visualization_Scale_Linear$ticks = F2(
	function (_p0, count) {
		var _p1 = _p0;
		return A3(_gampleman$elm_visualization$Visualization_List$ticks, _p1._0, _p1._1, count);
	});
var _gampleman$elm_visualization$Visualization_Scale_Linear$deinterpolate = F3(
	function (a, b, x) {
		var normalizedB = b - a;
		return _elm_lang$core$Native_Utils.eq(normalizedB, 0) ? 0 : ((x - a) / normalizedB);
	});
var _gampleman$elm_visualization$Visualization_Scale_Linear$invert = F2(
	function (domain, range) {
		return A4(_gampleman$elm_visualization$Visualization_Scale_Internal$bimap, range, domain, _gampleman$elm_visualization$Visualization_Scale_Linear$deinterpolate, _gampleman$elm_visualization$Visualization_Scale_Linear$interpolate);
	});
var _gampleman$elm_visualization$Visualization_Scale_Linear$convert = F2(
	function (domain, range) {
		return A4(_gampleman$elm_visualization$Visualization_Scale_Internal$bimap, domain, range, _gampleman$elm_visualization$Visualization_Scale_Linear$deinterpolate, _gampleman$elm_visualization$Visualization_Interpolate$interpolateFloat);
	});
var _gampleman$elm_visualization$Visualization_Scale_Linear$tickFormat = F2(
	function (_p3, _p2) {
		return _elm_lang$core$Basics$toString;
	});
var _gampleman$elm_visualization$Visualization_Scale_Linear$nice = F2(
	function (_p4, count) {
		var _p5 = _p4;
		var _p7 = _p5._1;
		var _p6 = _p5._0;
		var step0 = A3(_gampleman$elm_visualization$Visualization_List$tickStep, _p6, _p7, count);
		var step1 = A3(
			_gampleman$elm_visualization$Visualization_List$tickStep,
			_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$floor(_p6 / step0)) * step0,
			_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$ceiling(_p7 / step0)) * step0,
			count);
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$floor(_p6 / step1)) * step1,
			_1: _elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$ceiling(_p7 / step1)) * step1
		};
	});
var _gampleman$elm_visualization$Visualization_Scale_Linear$rangeExtent = F2(
	function (d, r) {
		return r;
	});

var _gampleman$elm_visualization$Visualization_Scale_Log$nice = F3(
	function (base, _p1, _p0) {
		var _p2 = _p1;
		var c = function (_p3) {
			return function (a) {
				return Math.pow(a, base);
			}(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$ceiling(
						A2(_elm_lang$core$Basics$logBase, base, _p3))));
		};
		var f = function (_p4) {
			return function (a) {
				return Math.pow(a, base);
			}(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$floor(
						A2(_elm_lang$core$Basics$logBase, base, _p4))));
		};
		return {
			ctor: '_Tuple2',
			_0: f(_p2._0),
			_1: c(_p2._1)
		};
	});
var _gampleman$elm_visualization$Visualization_Scale_Log$tickFormat = F2(
	function (_p6, _p5) {
		return _elm_lang$core$Basics$toString;
	});
var _gampleman$elm_visualization$Visualization_Scale_Log$ticks = F3(
	function (base, _p7, count) {
		var _p8 = _p7;
		var _p10 = _p8._0;
		var _p9 = _p8._1;
		var ticksHelper = F5(
			function (inc, st, i, j, k) {
				ticksHelper:
				while (true) {
					var p = Math.pow(i, base);
					var t = p * k;
					if (st(k)) {
						if (_elm_lang$core$Native_Utils.cmp(t, _p10) < 0) {
							var _v2 = inc,
								_v3 = st,
								_v4 = i,
								_v5 = j,
								_v6 = inc(k);
							inc = _v2;
							st = _v3;
							i = _v4;
							j = _v5;
							k = _v6;
							continue ticksHelper;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(t, _p9) > 0) {
								return {ctor: '[]'};
							} else {
								return A2(
									_elm_lang$core$Basics_ops['++'],
									A5(
										ticksHelper,
										inc,
										st,
										i,
										j,
										inc(k)),
									{
										ctor: '::',
										_0: t,
										_1: {ctor: '[]'}
									});
							}
						}
					} else {
						return {ctor: '[]'};
					}
				}
			});
		var n = _elm_lang$core$Basics$toFloat(count);
		var j = A2(_elm_lang$core$Basics$logBase, base, _p9);
		var i = A2(_elm_lang$core$Basics$logBase, base, _p10);
		return ((!_elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$round(base)),
			base)) && (_elm_lang$core$Native_Utils.cmp(j - i, n) < 0)) ? ((_elm_lang$core$Native_Utils.cmp(_p10, 0) > 0) ? A5(
			ticksHelper,
			function (k) {
				return k + 1;
			},
			function (k) {
				return _elm_lang$core$Native_Utils.cmp(k, base) < 0;
			},
			_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$round(i) - 1),
			_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$round(j) + 1),
			1) : A5(
			ticksHelper,
			function (k) {
				return k - 1;
			},
			function (k) {
				return _elm_lang$core$Native_Utils.cmp(k, 1) > -1;
			},
			_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$round(i) - 1),
			_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Basics$round(j) + 1),
			base - 1)) : A2(
			_elm_lang$core$List$map,
			function (a) {
				return Math.pow(a, base);
			},
			A3(
				_gampleman$elm_visualization$Visualization_List$ticks,
				i,
				j,
				_elm_lang$core$Basics$round(
					A2(_elm_lang$core$Basics$min, j - i, n))));
	});
var _gampleman$elm_visualization$Visualization_Scale_Log$interpolate = F3(
	function (a, b, x) {
		return (_elm_lang$core$Native_Utils.cmp(a, 0) < 0) ? (Math.pow(0 - b, x) * Math.pow(0 - a, 1 - x)) : (Math.pow(b, x) * Math.pow(a, 1 - x));
	});
var _gampleman$elm_visualization$Visualization_Scale_Log$log = _elm_lang$core$Basics$logBase(_elm_lang$core$Basics$e);
var _gampleman$elm_visualization$Visualization_Scale_Log$deinterpolate = F3(
	function (a, b, x) {
		return _gampleman$elm_visualization$Visualization_Scale_Log$log(x / a) / _gampleman$elm_visualization$Visualization_Scale_Log$log(b / a);
	});
var _gampleman$elm_visualization$Visualization_Scale_Log$convert = F2(
	function (domain, range) {
		return A4(_gampleman$elm_visualization$Visualization_Scale_Internal$bimap, domain, range, _gampleman$elm_visualization$Visualization_Scale_Log$deinterpolate, _gampleman$elm_visualization$Visualization_Interpolate$interpolateFloat);
	});
var _gampleman$elm_visualization$Visualization_Scale_Log$invert = F2(
	function (domain, range) {
		return A4(_gampleman$elm_visualization$Visualization_Scale_Internal$bimap, range, domain, _gampleman$elm_visualization$Visualization_Scale_Log$deinterpolate, _gampleman$elm_visualization$Visualization_Scale_Log$interpolate);
	});
var _gampleman$elm_visualization$Visualization_Scale_Log$rangeExtent = F2(
	function (d, r) {
		return r;
	});

var _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond = 1000;
var _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute = 60 * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond;
var _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour = 60 * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute;
var _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerDay = 24 * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour;
var _justinmimbs$elm_date_extra$Date_Extra_Facts$dayOfWeekFromWeekdayNumber = function (n) {
	var _p0 = n;
	switch (_p0) {
		case 1:
			return _elm_lang$core$Date$Mon;
		case 2:
			return _elm_lang$core$Date$Tue;
		case 3:
			return _elm_lang$core$Date$Wed;
		case 4:
			return _elm_lang$core$Date$Thu;
		case 5:
			return _elm_lang$core$Date$Fri;
		case 6:
			return _elm_lang$core$Date$Sat;
		default:
			return _elm_lang$core$Date$Sun;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$weekdayNumberFromDayOfWeek = function (d) {
	var _p1 = d;
	switch (_p1.ctor) {
		case 'Mon':
			return 1;
		case 'Tue':
			return 2;
		case 'Wed':
			return 3;
		case 'Thu':
			return 4;
		case 'Fri':
			return 5;
		case 'Sat':
			return 6;
		default:
			return 7;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$monthFromMonthNumber = function (n) {
	var _p2 = n;
	switch (_p2) {
		case 1:
			return _elm_lang$core$Date$Jan;
		case 2:
			return _elm_lang$core$Date$Feb;
		case 3:
			return _elm_lang$core$Date$Mar;
		case 4:
			return _elm_lang$core$Date$Apr;
		case 5:
			return _elm_lang$core$Date$May;
		case 6:
			return _elm_lang$core$Date$Jun;
		case 7:
			return _elm_lang$core$Date$Jul;
		case 8:
			return _elm_lang$core$Date$Aug;
		case 9:
			return _elm_lang$core$Date$Sep;
		case 10:
			return _elm_lang$core$Date$Oct;
		case 11:
			return _elm_lang$core$Date$Nov;
		default:
			return _elm_lang$core$Date$Dec;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$monthNumberFromMonth = function (m) {
	var _p3 = m;
	switch (_p3.ctor) {
		case 'Jan':
			return 1;
		case 'Feb':
			return 2;
		case 'Mar':
			return 3;
		case 'Apr':
			return 4;
		case 'May':
			return 5;
		case 'Jun':
			return 6;
		case 'Jul':
			return 7;
		case 'Aug':
			return 8;
		case 'Sep':
			return 9;
		case 'Oct':
			return 10;
		case 'Nov':
			return 11;
		default:
			return 12;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$months = {
	ctor: '::',
	_0: _elm_lang$core$Date$Jan,
	_1: {
		ctor: '::',
		_0: _elm_lang$core$Date$Feb,
		_1: {
			ctor: '::',
			_0: _elm_lang$core$Date$Mar,
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Date$Apr,
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Date$May,
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Date$Jun,
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Date$Jul,
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Date$Aug,
								_1: {
									ctor: '::',
									_0: _elm_lang$core$Date$Sep,
									_1: {
										ctor: '::',
										_0: _elm_lang$core$Date$Oct,
										_1: {
											ctor: '::',
											_0: _elm_lang$core$Date$Nov,
											_1: {
												ctor: '::',
												_0: _elm_lang$core$Date$Dec,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear = function (y) {
	return (_elm_lang$core$Native_Utils.eq(
		A2(_elm_lang$core$Basics_ops['%'], y, 4),
		0) && (!_elm_lang$core$Native_Utils.eq(
		A2(_elm_lang$core$Basics_ops['%'], y, 100),
		0))) || _elm_lang$core$Native_Utils.eq(
		A2(_elm_lang$core$Basics_ops['%'], y, 400),
		0);
};
var _justinmimbs$elm_date_extra$Date_Extra_Facts$daysInMonth = F2(
	function (y, m) {
		var _p4 = m;
		switch (_p4.ctor) {
			case 'Jan':
				return 31;
			case 'Feb':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 29 : 28;
			case 'Mar':
				return 31;
			case 'Apr':
				return 30;
			case 'May':
				return 31;
			case 'Jun':
				return 30;
			case 'Jul':
				return 31;
			case 'Aug':
				return 31;
			case 'Sep':
				return 30;
			case 'Oct':
				return 31;
			case 'Nov':
				return 30;
			default:
				return 31;
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra_Facts$daysBeforeStartOfMonth = F2(
	function (y, m) {
		var _p5 = m;
		switch (_p5.ctor) {
			case 'Jan':
				return 0;
			case 'Feb':
				return 31;
			case 'Mar':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 60 : 59;
			case 'Apr':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 91 : 90;
			case 'May':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 121 : 120;
			case 'Jun':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 152 : 151;
			case 'Jul':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 182 : 181;
			case 'Aug':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 213 : 212;
			case 'Sep':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 244 : 243;
			case 'Oct':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 274 : 273;
			case 'Nov':
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 305 : 304;
			default:
				return _justinmimbs$elm_date_extra$Date_Extra_Facts$isLeapYear(y) ? 335 : 334;
		}
	});

var _justinmimbs$elm_date_extra$Date_Internal_RataDie$toUnixTime = function (rd) {
	return (rd - 719163) * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerDay;
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekdayNumber = function (rd) {
	var _p0 = A2(_elm_lang$core$Basics_ops['%'], rd, 7);
	if (_p0 === 0) {
		return 7;
	} else {
		return _p0;
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$leapYearsInCommonEra = function (y) {
	return (((y / 4) | 0) - ((y / 100) | 0)) + ((y / 400) | 0);
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$rataDieBeforeStartOfYear = function (y) {
	return (365 * (y - 1)) + _justinmimbs$elm_date_extra$Date_Internal_RataDie$leapYearsInCommonEra(y - 1);
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$fromOrdinalDate = F2(
	function (y, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$rataDieBeforeStartOfYear(y) + d;
	});
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$week1Day1OfWeekYear = function (y) {
	var jan4RD = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromOrdinalDate, y, 4);
	return (jan4RD - _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekdayNumber(jan4RD)) + 1;
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$fromWeekDate = F3(
	function (y, w, d) {
		var week1Day0RD = _justinmimbs$elm_date_extra$Date_Internal_RataDie$week1Day1OfWeekYear(y) - 1;
		return (week1Day0RD + ((w - 1) * 7)) + d;
	});
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate = F3(
	function (y, m, d) {
		var md = A2(_justinmimbs$elm_date_extra$Date_Extra_Facts$daysBeforeStartOfMonth, y, m);
		var yd = _justinmimbs$elm_date_extra$Date_Internal_RataDie$rataDieBeforeStartOfYear(y);
		return (yd + md) + d;
	});
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt = F2(
	function (a, b) {
		return {
			ctor: '_Tuple2',
			_0: (a / b) | 0,
			_1: A2(_elm_lang$core$Basics$rem, a, b)
		};
	});
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$year = function (rd) {
	var _p1 = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt, rd, 146097);
	var q400 = _p1._0;
	var r400 = _p1._1;
	var _p2 = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt, r400, 36524);
	var q100 = _p2._0;
	var r100 = _p2._1;
	var _p3 = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt, r100, 1461);
	var q4 = _p3._0;
	var r4 = _p3._1;
	var _p4 = A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$divideInt, r4, 365);
	var q1 = _p4._0;
	var r1 = _p4._1;
	var n = _elm_lang$core$Native_Utils.eq(r1, 0) ? 0 : 1;
	return ((((q400 * 400) + (q100 * 100)) + (q4 * 4)) + q1) + n;
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$ordinalDay = function (rd) {
	return rd - _justinmimbs$elm_date_extra$Date_Internal_RataDie$rataDieBeforeStartOfYear(
		_justinmimbs$elm_date_extra$Date_Internal_RataDie$year(rd));
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekYear = function (rd) {
	var daysToThursday = 4 - _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekdayNumber(rd);
	return _justinmimbs$elm_date_extra$Date_Internal_RataDie$year(rd + daysToThursday);
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekNumber = function (rd) {
	var week1Day1RD = _justinmimbs$elm_date_extra$Date_Internal_RataDie$week1Day1OfWeekYear(
		_justinmimbs$elm_date_extra$Date_Internal_RataDie$weekYear(rd));
	return (((rd - week1Day1RD) / 7) | 0) + 1;
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$find = F2(
	function (pred, list) {
		find:
		while (true) {
			var _p5 = list;
			if (_p5.ctor === '[]') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p6 = _p5._0;
				if (pred(_p6)) {
					return _elm_lang$core$Maybe$Just(_p6);
				} else {
					var _v2 = pred,
						_v3 = _p5._1;
					pred = _v2;
					list = _v3;
					continue find;
				}
			}
		}
	});
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$month = function (rd) {
	var od = _justinmimbs$elm_date_extra$Date_Internal_RataDie$ordinalDay(rd);
	var y = _justinmimbs$elm_date_extra$Date_Internal_RataDie$year(rd);
	return A2(
		_elm_lang$core$Maybe$withDefault,
		_elm_lang$core$Date$Jan,
		A2(
			_justinmimbs$elm_date_extra$Date_Internal_RataDie$find,
			function (m) {
				return _elm_lang$core$Native_Utils.cmp(
					A2(_justinmimbs$elm_date_extra$Date_Extra_Facts$daysBeforeStartOfMonth, y, m),
					od) < 0;
			},
			_elm_lang$core$List$reverse(_justinmimbs$elm_date_extra$Date_Extra_Facts$months)));
};
var _justinmimbs$elm_date_extra$Date_Internal_RataDie$day = function (rd) {
	var od = _justinmimbs$elm_date_extra$Date_Internal_RataDie$ordinalDay(rd);
	var m = _justinmimbs$elm_date_extra$Date_Internal_RataDie$month(rd);
	var y = _justinmimbs$elm_date_extra$Date_Internal_RataDie$year(rd);
	return od - A2(_justinmimbs$elm_date_extra$Date_Extra_Facts$daysBeforeStartOfMonth, y, m);
};

var _justinmimbs$elm_date_extra$Date_Internal_Core$weekNumberFromCalendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekNumber(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate, y, m, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$weekYearFromCalendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$weekYear(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate, y, m, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromOrdinalDate = F2(
	function (y, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$toUnixTime(
			A2(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromOrdinalDate, y, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromWeekDate = F3(
	function (y, w, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$toUnixTime(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromWeekDate, y, w, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$toUnixTime(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate, y, m, d));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$msFromTimeParts = F4(
	function (hh, mm, ss, ms) {
		return ((ms + (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond * ss)) + (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute * mm)) + (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour * hh);
	});
var _justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromParts = F7(
	function (y, m, d, hh, mm, ss, ms) {
		return _justinmimbs$elm_date_extra$Date_Internal_RataDie$toUnixTime(
			A3(_justinmimbs$elm_date_extra$Date_Internal_RataDie$fromCalendarDate, y, m, d)) + A4(_justinmimbs$elm_date_extra$Date_Internal_Core$msFromTimeParts, hh, mm, ss, ms);
	});

var _justinmimbs$elm_date_extra$Date_Internal_Extract$msOffsetFromUtc = function (date) {
	var utcTime = _elm_lang$core$Date$toTime(date);
	var localTime = _elm_lang$core$Basics$toFloat(
		A7(
			_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromParts,
			_elm_lang$core$Date$year(date),
			_elm_lang$core$Date$month(date),
			_elm_lang$core$Date$day(date),
			_elm_lang$core$Date$hour(date),
			_elm_lang$core$Date$minute(date),
			_elm_lang$core$Date$second(date),
			_elm_lang$core$Date$millisecond(date)));
	return _elm_lang$core$Basics$floor(localTime - utcTime);
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc = function (date) {
	return (_justinmimbs$elm_date_extra$Date_Internal_Extract$msOffsetFromUtc(date) / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute) | 0;
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$weekYear = function (date) {
	return A3(
		_justinmimbs$elm_date_extra$Date_Internal_Core$weekYearFromCalendarDate,
		_elm_lang$core$Date$year(date),
		_elm_lang$core$Date$month(date),
		_elm_lang$core$Date$day(date));
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$weekNumber = function (date) {
	return A3(
		_justinmimbs$elm_date_extra$Date_Internal_Core$weekNumberFromCalendarDate,
		_elm_lang$core$Date$year(date),
		_elm_lang$core$Date$month(date),
		_elm_lang$core$Date$day(date));
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$weekdayNumber = function (_p0) {
	return _justinmimbs$elm_date_extra$Date_Extra_Facts$weekdayNumberFromDayOfWeek(
		_elm_lang$core$Date$dayOfWeek(_p0));
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$fractionalDay = function (date) {
	var timeOfDayMS = A4(
		_justinmimbs$elm_date_extra$Date_Internal_Core$msFromTimeParts,
		_elm_lang$core$Date$hour(date),
		_elm_lang$core$Date$minute(date),
		_elm_lang$core$Date$second(date),
		_elm_lang$core$Date$millisecond(date));
	return _elm_lang$core$Basics$toFloat(timeOfDayMS) / _elm_lang$core$Basics$toFloat(_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerDay);
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay = function (date) {
	return A2(
		_justinmimbs$elm_date_extra$Date_Extra_Facts$daysBeforeStartOfMonth,
		_elm_lang$core$Date$year(date),
		_elm_lang$core$Date$month(date)) + _elm_lang$core$Date$day(date);
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber = function (_p1) {
	return _justinmimbs$elm_date_extra$Date_Extra_Facts$monthNumberFromMonth(
		_elm_lang$core$Date$month(_p1));
};
var _justinmimbs$elm_date_extra$Date_Internal_Extract$quarter = function (date) {
	return _elm_lang$core$Basics$ceiling(
		function (n) {
			return n / 3;
		}(
			_elm_lang$core$Basics$toFloat(
				_justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber(date))));
};

var _justinmimbs$elm_date_extra$Date_Internal_Format$toUtc = function (date) {
	return _elm_lang$core$Date$fromTime(
		_elm_lang$core$Date$toTime(date) - _elm_lang$core$Basics$toFloat(
			_justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc(date) * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute));
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$nameForm = function (length) {
	var _p0 = length;
	switch (_p0) {
		case 1:
			return 'abbreviated';
		case 2:
			return 'abbreviated';
		case 3:
			return 'abbreviated';
		case 4:
			return 'full';
		case 5:
			return 'narrow';
		case 6:
			return 'short';
		default:
			return 'invalid';
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$patternMatches = _elm_lang$core$Regex$regex('([yYQMwdDEeabhHmsSXx])\\1*|\'(?:[^\']|\'\')*?\'(?!\')');
var _justinmimbs$elm_date_extra$Date_Internal_Format$formatTimeOffset = F3(
	function (separator, minutesOptional, offset) {
		var mm = A3(
			_elm_lang$core$String$padLeft,
			2,
			_elm_lang$core$Native_Utils.chr('0'),
			_elm_lang$core$Basics$toString(
				A2(
					_elm_lang$core$Basics_ops['%'],
					_elm_lang$core$Basics$abs(offset),
					60)));
		var hh = A3(
			_elm_lang$core$String$padLeft,
			2,
			_elm_lang$core$Native_Utils.chr('0'),
			_elm_lang$core$Basics$toString(
				(_elm_lang$core$Basics$abs(offset) / 60) | 0));
		var sign = (_elm_lang$core$Native_Utils.cmp(offset, 0) > -1) ? '+' : '-';
		return (minutesOptional && _elm_lang$core$Native_Utils.eq(mm, '00')) ? A2(_elm_lang$core$Basics_ops['++'], sign, hh) : A2(
			_elm_lang$core$Basics_ops['++'],
			sign,
			A2(
				_elm_lang$core$Basics_ops['++'],
				hh,
				A2(_elm_lang$core$Basics_ops['++'], separator, mm)));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Format$ordinalSuffix = function (n) {
	var nn = A2(_elm_lang$core$Basics_ops['%'], n, 100);
	var _p1 = A2(
		_elm_lang$core$Basics$min,
		(_elm_lang$core$Native_Utils.cmp(nn, 20) < 0) ? nn : A2(_elm_lang$core$Basics_ops['%'], nn, 10),
		4);
	switch (_p1) {
		case 0:
			return 'th';
		case 1:
			return 'st';
		case 2:
			return 'nd';
		case 3:
			return 'rd';
		case 4:
			return 'th';
		default:
			return '';
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$withOrdinalSuffix = function (n) {
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_elm_lang$core$Basics$toString(n),
		_justinmimbs$elm_date_extra$Date_Internal_Format$ordinalSuffix(n));
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$hour12 = function (date) {
	var _p2 = A2(
		_elm_lang$core$Basics_ops['%'],
		_elm_lang$core$Date$hour(date),
		12);
	if (_p2 === 0) {
		return 12;
	} else {
		return _p2;
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName = function (d) {
	var _p3 = d;
	switch (_p3.ctor) {
		case 'Mon':
			return 'Monday';
		case 'Tue':
			return 'Tuesday';
		case 'Wed':
			return 'Wednesday';
		case 'Thu':
			return 'Thursday';
		case 'Fri':
			return 'Friday';
		case 'Sat':
			return 'Saturday';
		default:
			return 'Sunday';
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$monthName = function (m) {
	var _p4 = m;
	switch (_p4.ctor) {
		case 'Jan':
			return 'January';
		case 'Feb':
			return 'February';
		case 'Mar':
			return 'March';
		case 'Apr':
			return 'April';
		case 'May':
			return 'May';
		case 'Jun':
			return 'June';
		case 'Jul':
			return 'July';
		case 'Aug':
			return 'August';
		case 'Sep':
			return 'September';
		case 'Oct':
			return 'October';
		case 'Nov':
			return 'November';
		default:
			return 'December';
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$PM = {ctor: 'PM'};
var _justinmimbs$elm_date_extra$Date_Internal_Format$Noon = {ctor: 'Noon'};
var _justinmimbs$elm_date_extra$Date_Internal_Format$AM = {ctor: 'AM'};
var _justinmimbs$elm_date_extra$Date_Internal_Format$Midnight = {ctor: 'Midnight'};
var _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod = function (date) {
	var onTheHour = _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Date$minute(date),
		0) && (_elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Date$second(date),
		0) && _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Date$millisecond(date),
		0));
	var hh = _elm_lang$core$Date$hour(date);
	return (_elm_lang$core$Native_Utils.eq(hh, 0) && onTheHour) ? _justinmimbs$elm_date_extra$Date_Internal_Format$Midnight : ((_elm_lang$core$Native_Utils.cmp(hh, 12) < 0) ? _justinmimbs$elm_date_extra$Date_Internal_Format$AM : ((_elm_lang$core$Native_Utils.eq(hh, 12) && onTheHour) ? _justinmimbs$elm_date_extra$Date_Internal_Format$Noon : _justinmimbs$elm_date_extra$Date_Internal_Format$PM));
};
var _justinmimbs$elm_date_extra$Date_Internal_Format$format = F3(
	function (asUtc, date, match) {
		format:
		while (true) {
			var length = _elm_lang$core$String$length(match);
			var $char = A2(_elm_lang$core$String$left, 1, match);
			var _p5 = $char;
			switch (_p5) {
				case 'y':
					var _p6 = length;
					if (_p6 === 2) {
						return A2(
							_elm_lang$core$String$right,
							2,
							A3(
								_elm_lang$core$String$padLeft,
								length,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$year(date))));
					} else {
						return A3(
							_elm_lang$core$String$padLeft,
							length,
							_elm_lang$core$Native_Utils.chr('0'),
							_elm_lang$core$Basics$toString(
								_elm_lang$core$Date$year(date)));
					}
				case 'Y':
					var _p7 = length;
					if (_p7 === 2) {
						return A2(
							_elm_lang$core$String$right,
							2,
							A3(
								_elm_lang$core$String$padLeft,
								length,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$weekYear(date))));
					} else {
						return A3(
							_elm_lang$core$String$padLeft,
							length,
							_elm_lang$core$Native_Utils.chr('0'),
							_elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$weekYear(date)));
					}
				case 'Q':
					var _p8 = length;
					switch (_p8) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date));
						case 2:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date));
						case 3:
							return A2(
								F2(
									function (x, y) {
										return A2(_elm_lang$core$Basics_ops['++'], x, y);
									}),
								'Q',
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date)));
						case 4:
							return _justinmimbs$elm_date_extra$Date_Internal_Format$withOrdinalSuffix(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date));
						case 5:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$quarter(date));
						default:
							return '';
					}
				case 'M':
					var _p9 = length;
					switch (_p9) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber(date)));
						case 3:
							return A2(
								_elm_lang$core$String$left,
								3,
								_justinmimbs$elm_date_extra$Date_Internal_Format$monthName(
									_elm_lang$core$Date$month(date)));
						case 4:
							return _justinmimbs$elm_date_extra$Date_Internal_Format$monthName(
								_elm_lang$core$Date$month(date));
						case 5:
							return A2(
								_elm_lang$core$String$left,
								1,
								_justinmimbs$elm_date_extra$Date_Internal_Format$monthName(
									_elm_lang$core$Date$month(date)));
						default:
							return '';
					}
				case 'w':
					var _p10 = length;
					switch (_p10) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$weekNumber(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$weekNumber(date)));
						default:
							return '';
					}
				case 'd':
					var _p11 = length;
					switch (_p11) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_elm_lang$core$Date$day(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$day(date)));
						case 3:
							return _justinmimbs$elm_date_extra$Date_Internal_Format$withOrdinalSuffix(
								_elm_lang$core$Date$day(date));
						default:
							return '';
					}
				case 'D':
					var _p12 = length;
					switch (_p12) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay(date)));
						case 3:
							return A3(
								_elm_lang$core$String$padLeft,
								3,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay(date)));
						default:
							return '';
					}
				case 'E':
					var _p13 = _justinmimbs$elm_date_extra$Date_Internal_Format$nameForm(length);
					switch (_p13) {
						case 'abbreviated':
							return A2(
								_elm_lang$core$String$left,
								3,
								_justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName(
									_elm_lang$core$Date$dayOfWeek(date)));
						case 'full':
							return _justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName(
								_elm_lang$core$Date$dayOfWeek(date));
						case 'narrow':
							return A2(
								_elm_lang$core$String$left,
								1,
								_justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName(
									_elm_lang$core$Date$dayOfWeek(date)));
						case 'short':
							return A2(
								_elm_lang$core$String$left,
								2,
								_justinmimbs$elm_date_extra$Date_Internal_Format$dayOfWeekName(
									_elm_lang$core$Date$dayOfWeek(date)));
						default:
							return '';
					}
				case 'e':
					var _p14 = length;
					switch (_p14) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$weekdayNumber(date));
						case 2:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Extract$weekdayNumber(date));
						default:
							var _v15 = asUtc,
								_v16 = date,
								_v17 = _elm_lang$core$String$toUpper(match);
							asUtc = _v15;
							date = _v16;
							match = _v17;
							continue format;
					}
				case 'a':
					var p = _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod(date);
					var m = (_elm_lang$core$Native_Utils.eq(p, _justinmimbs$elm_date_extra$Date_Internal_Format$Midnight) || _elm_lang$core$Native_Utils.eq(p, _justinmimbs$elm_date_extra$Date_Internal_Format$AM)) ? 'A' : 'P';
					var _p15 = _justinmimbs$elm_date_extra$Date_Internal_Format$nameForm(length);
					switch (_p15) {
						case 'abbreviated':
							return A2(_elm_lang$core$Basics_ops['++'], m, 'M');
						case 'full':
							return A2(_elm_lang$core$Basics_ops['++'], m, '.M.');
						case 'narrow':
							return m;
						default:
							return '';
					}
				case 'b':
					var _p16 = _justinmimbs$elm_date_extra$Date_Internal_Format$nameForm(length);
					switch (_p16) {
						case 'abbreviated':
							var _p17 = _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod(date);
							switch (_p17.ctor) {
								case 'Midnight':
									return 'mid.';
								case 'AM':
									return 'am';
								case 'Noon':
									return 'noon';
								default:
									return 'pm';
							}
						case 'full':
							var _p18 = _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod(date);
							switch (_p18.ctor) {
								case 'Midnight':
									return 'midnight';
								case 'AM':
									return 'a.m.';
								case 'Noon':
									return 'noon';
								default:
									return 'p.m.';
							}
						case 'narrow':
							var _p19 = _justinmimbs$elm_date_extra$Date_Internal_Format$dayPeriod(date);
							switch (_p19.ctor) {
								case 'Midnight':
									return 'md';
								case 'AM':
									return 'a';
								case 'Noon':
									return 'nn';
								default:
									return 'p';
							}
						default:
							return '';
					}
				case 'h':
					var _p20 = length;
					switch (_p20) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_justinmimbs$elm_date_extra$Date_Internal_Format$hour12(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_justinmimbs$elm_date_extra$Date_Internal_Format$hour12(date)));
						default:
							return '';
					}
				case 'H':
					var _p21 = length;
					switch (_p21) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_elm_lang$core$Date$hour(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$hour(date)));
						default:
							return '';
					}
				case 'm':
					var _p22 = length;
					switch (_p22) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_elm_lang$core$Date$minute(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$minute(date)));
						default:
							return '';
					}
				case 's':
					var _p23 = length;
					switch (_p23) {
						case 1:
							return _elm_lang$core$Basics$toString(
								_elm_lang$core$Date$second(date));
						case 2:
							return A3(
								_elm_lang$core$String$padLeft,
								2,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$second(date)));
						default:
							return '';
					}
				case 'S':
					return A3(
						_elm_lang$core$String$padRight,
						length,
						_elm_lang$core$Native_Utils.chr('0'),
						A2(
							_elm_lang$core$String$left,
							length,
							A3(
								_elm_lang$core$String$padLeft,
								3,
								_elm_lang$core$Native_Utils.chr('0'),
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Date$millisecond(date)))));
				case 'X':
					if ((_elm_lang$core$Native_Utils.cmp(length, 4) < 0) && (asUtc || _elm_lang$core$Native_Utils.eq(
						_justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc(date),
						0))) {
						return 'Z';
					} else {
						var _v27 = asUtc,
							_v28 = date,
							_v29 = _elm_lang$core$String$toLower(match);
						asUtc = _v27;
						date = _v28;
						match = _v29;
						continue format;
					}
				case 'x':
					var offset = asUtc ? 0 : _justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc(date);
					var _p24 = length;
					switch (_p24) {
						case 1:
							return A3(_justinmimbs$elm_date_extra$Date_Internal_Format$formatTimeOffset, '', true, offset);
						case 2:
							return A3(_justinmimbs$elm_date_extra$Date_Internal_Format$formatTimeOffset, '', false, offset);
						case 3:
							return A3(_justinmimbs$elm_date_extra$Date_Internal_Format$formatTimeOffset, ':', false, offset);
						default:
							return '';
					}
				case '\'':
					return _elm_lang$core$Native_Utils.eq(match, '\'\'') ? '\'' : A4(
						_elm_lang$core$Regex$replace,
						_elm_lang$core$Regex$All,
						_elm_lang$core$Regex$regex('\'\''),
						function (_p25) {
							return '\'';
						},
						A3(_elm_lang$core$String$slice, 1, -1, match));
				default:
					return '';
			}
		}
	});
var _justinmimbs$elm_date_extra$Date_Internal_Format$toFormattedString = F3(
	function (asUtc, pattern, date) {
		var date_ = asUtc ? _justinmimbs$elm_date_extra$Date_Internal_Format$toUtc(date) : date;
		return A4(
			_elm_lang$core$Regex$replace,
			_elm_lang$core$Regex$All,
			_justinmimbs$elm_date_extra$Date_Internal_Format$patternMatches,
			function (_p26) {
				return A3(
					_justinmimbs$elm_date_extra$Date_Internal_Format$format,
					asUtc,
					date_,
					function (_) {
						return _.match;
					}(_p26));
			},
			pattern);
	});

var _justinmimbs$elm_date_extra$Date_Internal_Parse$isoDateRegex = function () {
	var time = 'T(\\d{2})(?:(\\:)?(\\d{2})(?:\\10(\\d{2}))?)?(\\.\\d+)?(?:(Z)|(?:([+\\-])(\\d{2})(?:\\:?(\\d{2}))?))?';
	var ord = '\\-?(\\d{3})';
	var week = '(\\-)?W(\\d{2})(?:\\5(\\d))?';
	var cal = '(\\-)?(\\d{2})(?:\\2(\\d{2}))?';
	var year = '(\\d{4})';
	return _elm_lang$core$Regex$regex(
		A2(
			_elm_lang$core$Basics_ops['++'],
			'^',
			A2(
				_elm_lang$core$Basics_ops['++'],
				year,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'(?:',
					A2(
						_elm_lang$core$Basics_ops['++'],
						cal,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'|',
							A2(
								_elm_lang$core$Basics_ops['++'],
								week,
								A2(
									_elm_lang$core$Basics_ops['++'],
									'|',
									A2(
										_elm_lang$core$Basics_ops['++'],
										ord,
										A2(
											_elm_lang$core$Basics_ops['++'],
											')?',
											A2(
												_elm_lang$core$Basics_ops['++'],
												'(?:',
												A2(_elm_lang$core$Basics_ops['++'], time, ')?$'))))))))))));
}();
var _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToFloat = function (_p0) {
	return _elm_lang$core$Result$toMaybe(
		_elm_lang$core$String$toFloat(_p0));
};
var _justinmimbs$elm_date_extra$Date_Internal_Parse$msFromMatches = F4(
	function (timeHH, timeMM, timeSS, timeF) {
		var fractional = A2(
			_elm_lang$core$Maybe$withDefault,
			0.0,
			A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToFloat, timeF));
		var _p1 = function () {
			var _p2 = A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Maybe$andThen(_justinmimbs$elm_date_extra$Date_Internal_Parse$stringToFloat),
				{
					ctor: '::',
					_0: timeHH,
					_1: {
						ctor: '::',
						_0: timeMM,
						_1: {
							ctor: '::',
							_0: timeSS,
							_1: {ctor: '[]'}
						}
					}
				});
			_v0_3:
			do {
				if (((_p2.ctor === '::') && (_p2._0.ctor === 'Just')) && (_p2._1.ctor === '::')) {
					if (_p2._1._0.ctor === 'Just') {
						if (_p2._1._1.ctor === '::') {
							if (_p2._1._1._0.ctor === 'Just') {
								if (_p2._1._1._1.ctor === '[]') {
									return {ctor: '_Tuple3', _0: _p2._0._0, _1: _p2._1._0._0, _2: _p2._1._1._0._0 + fractional};
								} else {
									break _v0_3;
								}
							} else {
								if (_p2._1._1._1.ctor === '[]') {
									return {ctor: '_Tuple3', _0: _p2._0._0, _1: _p2._1._0._0 + fractional, _2: 0.0};
								} else {
									break _v0_3;
								}
							}
						} else {
							break _v0_3;
						}
					} else {
						if (((_p2._1._1.ctor === '::') && (_p2._1._1._0.ctor === 'Nothing')) && (_p2._1._1._1.ctor === '[]')) {
							return {ctor: '_Tuple3', _0: _p2._0._0 + fractional, _1: 0.0, _2: 0.0};
						} else {
							break _v0_3;
						}
					}
				} else {
					break _v0_3;
				}
			} while(false);
			return {ctor: '_Tuple3', _0: 0.0, _1: 0.0, _2: 0.0};
		}();
		var hh = _p1._0;
		var mm = _p1._1;
		var ss = _p1._2;
		return _elm_lang$core$Basics$round(
			((hh * _elm_lang$core$Basics$toFloat(_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour)) + (mm * _elm_lang$core$Basics$toFloat(_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute))) + (ss * _elm_lang$core$Basics$toFloat(_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond)));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt = function (_p3) {
	return _elm_lang$core$Result$toMaybe(
		_elm_lang$core$String$toInt(_p3));
};
var _justinmimbs$elm_date_extra$Date_Internal_Parse$unixTimeFromMatches = F6(
	function (yyyy, calMM, calDD, weekWW, weekD, ordDDD) {
		var y = A2(
			_elm_lang$core$Maybe$withDefault,
			1,
			_justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt(yyyy));
		var _p4 = {ctor: '_Tuple2', _0: calMM, _1: weekWW};
		_v1_2:
		do {
			if (_p4.ctor === '_Tuple2') {
				if (_p4._0.ctor === 'Just') {
					if (_p4._1.ctor === 'Nothing') {
						return A3(
							_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate,
							y,
							_justinmimbs$elm_date_extra$Date_Extra_Facts$monthFromMonthNumber(
								A2(
									_elm_lang$core$Maybe$withDefault,
									1,
									A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, calMM))),
							A2(
								_elm_lang$core$Maybe$withDefault,
								1,
								A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, calDD)));
					} else {
						break _v1_2;
					}
				} else {
					if (_p4._1.ctor === 'Just') {
						return A3(
							_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromWeekDate,
							y,
							A2(
								_elm_lang$core$Maybe$withDefault,
								1,
								A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, weekWW)),
							A2(
								_elm_lang$core$Maybe$withDefault,
								1,
								A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, weekD)));
					} else {
						break _v1_2;
					}
				}
			} else {
				break _v1_2;
			}
		} while(false);
		return A2(
			_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromOrdinalDate,
			y,
			A2(
				_elm_lang$core$Maybe$withDefault,
				1,
				A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, ordDDD)));
	});
var _justinmimbs$elm_date_extra$Date_Internal_Parse$offsetFromMatches = F4(
	function (tzZ, tzSign, tzHH, tzMM) {
		var _p5 = {ctor: '_Tuple2', _0: tzZ, _1: tzSign};
		_v2_2:
		do {
			if (_p5.ctor === '_Tuple2') {
				if (_p5._0.ctor === 'Just') {
					if ((_p5._0._0 === 'Z') && (_p5._1.ctor === 'Nothing')) {
						return _elm_lang$core$Maybe$Just(0);
					} else {
						break _v2_2;
					}
				} else {
					if (_p5._1.ctor === 'Just') {
						var mm = A2(
							_elm_lang$core$Maybe$withDefault,
							0,
							A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, tzMM));
						var hh = A2(
							_elm_lang$core$Maybe$withDefault,
							0,
							A2(_elm_lang$core$Maybe$andThen, _justinmimbs$elm_date_extra$Date_Internal_Parse$stringToInt, tzHH));
						return _elm_lang$core$Maybe$Just(
							(_elm_lang$core$Native_Utils.eq(_p5._1._0, '+') ? 1 : -1) * ((hh * 60) + mm));
					} else {
						break _v2_2;
					}
				}
			} else {
				break _v2_2;
			}
		} while(false);
		return _elm_lang$core$Maybe$Nothing;
	});
var _justinmimbs$elm_date_extra$Date_Internal_Parse$offsetTimeFromMatches = function (matches) {
	var _p6 = matches;
	if (((((((((((((((((((_p6.ctor === '::') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === '::')) && (_p6._1._1.ctor === '::')) && (_p6._1._1._1.ctor === '::')) && (_p6._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '::')) && (_p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1.ctor === '[]')) {
		var offset = A4(_justinmimbs$elm_date_extra$Date_Internal_Parse$offsetFromMatches, _p6._1._1._1._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._1._0);
		var timeMS = A4(_justinmimbs$elm_date_extra$Date_Internal_Parse$msFromMatches, _p6._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._1._1._1._1._1._0);
		var dateMS = A6(_justinmimbs$elm_date_extra$Date_Internal_Parse$unixTimeFromMatches, _p6._0._0, _p6._1._1._0, _p6._1._1._1._0, _p6._1._1._1._1._1._0, _p6._1._1._1._1._1._1._0, _p6._1._1._1._1._1._1._1._0);
		return _elm_lang$core$Maybe$Just(
			{ctor: '_Tuple2', _0: offset, _1: dateMS + timeMS});
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _justinmimbs$elm_date_extra$Date_Internal_Parse$offsetTimeFromIsoString = function (s) {
	return A2(
		_elm_lang$core$Maybe$andThen,
		_justinmimbs$elm_date_extra$Date_Internal_Parse$offsetTimeFromMatches,
		A2(
			_elm_lang$core$Maybe$map,
			function (_) {
				return _.submatches;
			},
			_elm_lang$core$List$head(
				A3(
					_elm_lang$core$Regex$find,
					_elm_lang$core$Regex$AtMost(1),
					_justinmimbs$elm_date_extra$Date_Internal_Parse$isoDateRegex,
					s))));
};

var _justinmimbs$elm_date_extra$Date_Extra$unfold = F2(
	function (f, seed) {
		var _p0 = f(seed);
		if (_p0.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			return {
				ctor: '::',
				_0: _p0._0._0,
				_1: A2(_justinmimbs$elm_date_extra$Date_Extra$unfold, f, _p0._0._1)
			};
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$toParts = function (date) {
	return {
		ctor: '_Tuple7',
		_0: _elm_lang$core$Date$year(date),
		_1: _elm_lang$core$Date$month(date),
		_2: _elm_lang$core$Date$day(date),
		_3: _elm_lang$core$Date$hour(date),
		_4: _elm_lang$core$Date$minute(date),
		_5: _elm_lang$core$Date$second(date),
		_6: _elm_lang$core$Date$millisecond(date)
	};
};
var _justinmimbs$elm_date_extra$Date_Extra$monthFromQuarter = function (q) {
	var _p1 = q;
	switch (_p1) {
		case 1:
			return _elm_lang$core$Date$Jan;
		case 2:
			return _elm_lang$core$Date$Apr;
		case 3:
			return _elm_lang$core$Date$Jul;
		default:
			return _elm_lang$core$Date$Oct;
	}
};
var _justinmimbs$elm_date_extra$Date_Extra$clamp = F3(
	function (min, max, date) {
		return (_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Date$toTime(date),
			_elm_lang$core$Date$toTime(min)) < 0) ? min : ((_elm_lang$core$Native_Utils.cmp(
			_elm_lang$core$Date$toTime(date),
			_elm_lang$core$Date$toTime(max)) > 0) ? max : date);
	});
var _justinmimbs$elm_date_extra$Date_Extra$comparableIsBetween = F3(
	function (a, b, x) {
		return ((_elm_lang$core$Native_Utils.cmp(a, x) < 1) && (_elm_lang$core$Native_Utils.cmp(x, b) < 1)) || ((_elm_lang$core$Native_Utils.cmp(b, x) < 1) && (_elm_lang$core$Native_Utils.cmp(x, a) < 1));
	});
var _justinmimbs$elm_date_extra$Date_Extra$isBetween = F3(
	function (date1, date2, date) {
		return A3(
			_justinmimbs$elm_date_extra$Date_Extra$comparableIsBetween,
			_elm_lang$core$Date$toTime(date1),
			_elm_lang$core$Date$toTime(date2),
			_elm_lang$core$Date$toTime(date));
	});
var _justinmimbs$elm_date_extra$Date_Extra$compare = F2(
	function (a, b) {
		return A2(
			_elm_lang$core$Basics$compare,
			_elm_lang$core$Date$toTime(a),
			_elm_lang$core$Date$toTime(b));
	});
var _justinmimbs$elm_date_extra$Date_Extra$equal = F2(
	function (a, b) {
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Date$toTime(a),
			_elm_lang$core$Date$toTime(b));
	});
var _justinmimbs$elm_date_extra$Date_Extra$offsetFromUtc = _justinmimbs$elm_date_extra$Date_Internal_Extract$offsetFromUtc;
var _justinmimbs$elm_date_extra$Date_Extra$weekYear = _justinmimbs$elm_date_extra$Date_Internal_Extract$weekYear;
var _justinmimbs$elm_date_extra$Date_Extra$weekNumber = _justinmimbs$elm_date_extra$Date_Internal_Extract$weekNumber;
var _justinmimbs$elm_date_extra$Date_Extra$weekdayNumber = _justinmimbs$elm_date_extra$Date_Internal_Extract$weekdayNumber;
var _justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek = F2(
	function (d, date) {
		return _elm_lang$core$Basics$negate(
			A2(
				_elm_lang$core$Basics_ops['%'],
				(_justinmimbs$elm_date_extra$Date_Extra$weekdayNumber(date) - _justinmimbs$elm_date_extra$Date_Extra_Facts$weekdayNumberFromDayOfWeek(d)) + 7,
				7));
	});
var _justinmimbs$elm_date_extra$Date_Extra$fractionalDay = _justinmimbs$elm_date_extra$Date_Internal_Extract$fractionalDay;
var _justinmimbs$elm_date_extra$Date_Extra$ordinalDay = _justinmimbs$elm_date_extra$Date_Internal_Extract$ordinalDay;
var _justinmimbs$elm_date_extra$Date_Extra$quarter = _justinmimbs$elm_date_extra$Date_Internal_Extract$quarter;
var _justinmimbs$elm_date_extra$Date_Extra$monthNumber = _justinmimbs$elm_date_extra$Date_Internal_Extract$monthNumber;
var _justinmimbs$elm_date_extra$Date_Extra$ordinalMonth = function (date) {
	return (_elm_lang$core$Date$year(date) * 12) + _justinmimbs$elm_date_extra$Date_Extra$monthNumber(date);
};
var _justinmimbs$elm_date_extra$Date_Extra$diffMonth = F2(
	function (date1, date2) {
		var fractionalMonth = function (date) {
			return (_elm_lang$core$Basics$toFloat(
				_elm_lang$core$Date$day(date) - 1) + _justinmimbs$elm_date_extra$Date_Extra$fractionalDay(date)) / 31;
		};
		var ordinalMonthFloat = function (date) {
			return _elm_lang$core$Basics$toFloat(
				_justinmimbs$elm_date_extra$Date_Extra$ordinalMonth(date)) + fractionalMonth(date);
		};
		return _elm_lang$core$Basics$truncate(
			ordinalMonthFloat(date2) - ordinalMonthFloat(date1));
	});
var _justinmimbs$elm_date_extra$Date_Extra$toUtcFormattedString = _justinmimbs$elm_date_extra$Date_Internal_Format$toFormattedString(true);
var _justinmimbs$elm_date_extra$Date_Extra$toUtcIsoString = _justinmimbs$elm_date_extra$Date_Extra$toUtcFormattedString('yyyy-MM-dd\'T\'HH:mm:ss.SSSXXX');
var _justinmimbs$elm_date_extra$Date_Extra$toFormattedString = _justinmimbs$elm_date_extra$Date_Internal_Format$toFormattedString(false);
var _justinmimbs$elm_date_extra$Date_Extra$toIsoString = _justinmimbs$elm_date_extra$Date_Extra$toFormattedString('yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx');
var _justinmimbs$elm_date_extra$Date_Extra$fromTime = function (_p2) {
	return _elm_lang$core$Date$fromTime(
		_elm_lang$core$Basics$toFloat(_p2));
};
var _justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime = function (_p3) {
	var _p4 = _p3;
	var _p6 = _p4._1;
	var _p5 = _p4._0;
	if (_p5.ctor === 'Just') {
		return _justinmimbs$elm_date_extra$Date_Extra$fromTime(_p6 - (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute * _p5._0));
	} else {
		var offset0 = _justinmimbs$elm_date_extra$Date_Extra$offsetFromUtc(
			_justinmimbs$elm_date_extra$Date_Extra$fromTime(_p6));
		var date1 = _justinmimbs$elm_date_extra$Date_Extra$fromTime(_p6 - (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute * offset0));
		var offset1 = _justinmimbs$elm_date_extra$Date_Extra$offsetFromUtc(date1);
		if (_elm_lang$core$Native_Utils.eq(offset0, offset1)) {
			return date1;
		} else {
			var date2 = _justinmimbs$elm_date_extra$Date_Extra$fromTime(_p6 - (_justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute * offset1));
			var offset2 = _justinmimbs$elm_date_extra$Date_Extra$offsetFromUtc(date2);
			return _elm_lang$core$Native_Utils.eq(offset1, offset2) ? date2 : date1;
		}
	}
};
var _justinmimbs$elm_date_extra$Date_Extra$fromParts = F7(
	function (y, m, d, hh, mm, ss, ms) {
		return _justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime(
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A7(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromParts, y, m, d, hh, mm, ss, ms)
			});
	});
var _justinmimbs$elm_date_extra$Date_Extra$addMonths = F2(
	function (n, date) {
		var om = (_justinmimbs$elm_date_extra$Date_Extra$ordinalMonth(date) + n) + -1;
		var y_ = (om / 12) | 0;
		var m_ = _justinmimbs$elm_date_extra$Date_Extra_Facts$monthFromMonthNumber(
			A2(_elm_lang$core$Basics_ops['%'], om, 12) + 1);
		var _p7 = _justinmimbs$elm_date_extra$Date_Extra$toParts(date);
		var y = _p7._0;
		var m = _p7._1;
		var d = _p7._2;
		var hh = _p7._3;
		var mm = _p7._4;
		var ss = _p7._5;
		var ms = _p7._6;
		var d_ = A2(
			_elm_lang$core$Basics$min,
			d,
			A2(_justinmimbs$elm_date_extra$Date_Extra_Facts$daysInMonth, y_, m_));
		return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y_, m_, d_, hh, mm, ss, ms);
	});
var _justinmimbs$elm_date_extra$Date_Extra$add = F3(
	function (interval, n, date) {
		var _p8 = _justinmimbs$elm_date_extra$Date_Extra$toParts(date);
		var y = _p8._0;
		var m = _p8._1;
		var d = _p8._2;
		var hh = _p8._3;
		var mm = _p8._4;
		var ss = _p8._5;
		var ms = _p8._6;
		var _p9 = interval;
		switch (_p9.ctor) {
			case 'Millisecond':
				return _elm_lang$core$Date$fromTime(
					_elm_lang$core$Date$toTime(date) + _elm_lang$core$Basics$toFloat(n));
			case 'Second':
				return _elm_lang$core$Date$fromTime(
					_elm_lang$core$Date$toTime(date) + _elm_lang$core$Basics$toFloat(n * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond));
			case 'Minute':
				return _elm_lang$core$Date$fromTime(
					_elm_lang$core$Date$toTime(date) + _elm_lang$core$Basics$toFloat(n * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute));
			case 'Hour':
				return _elm_lang$core$Date$fromTime(
					_elm_lang$core$Date$toTime(date) + _elm_lang$core$Basics$toFloat(n * _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour));
			case 'Day':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d + n, hh, mm, ss, ms);
			case 'Month':
				return A2(_justinmimbs$elm_date_extra$Date_Extra$addMonths, n, date);
			case 'Year':
				return A2(_justinmimbs$elm_date_extra$Date_Extra$addMonths, n * 12, date);
			case 'Quarter':
				return A2(_justinmimbs$elm_date_extra$Date_Extra$addMonths, n * 3, date);
			case 'Week':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d + (n * 7), hh, mm, ss, ms);
			default:
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d + (n * 7), hh, mm, ss, ms);
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime(
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Nothing,
				_1: A3(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate, y, m, d)
			});
	});
var _justinmimbs$elm_date_extra$Date_Extra$floor = F2(
	function (interval, date) {
		var _p10 = _justinmimbs$elm_date_extra$Date_Extra$toParts(date);
		var y = _p10._0;
		var m = _p10._1;
		var d = _p10._2;
		var hh = _p10._3;
		var mm = _p10._4;
		var ss = _p10._5;
		var _p11 = interval;
		switch (_p11.ctor) {
			case 'Millisecond':
				return date;
			case 'Second':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d, hh, mm, ss, 0);
			case 'Minute':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d, hh, mm, 0, 0);
			case 'Hour':
				return A7(_justinmimbs$elm_date_extra$Date_Extra$fromParts, y, m, d, hh, 0, 0, 0);
			case 'Day':
				return A3(_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate, y, m, d);
			case 'Month':
				return A3(_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate, y, m, 1);
			case 'Year':
				return A3(_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate, y, _elm_lang$core$Date$Jan, 1);
			case 'Quarter':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					_justinmimbs$elm_date_extra$Date_Extra$monthFromQuarter(
						_justinmimbs$elm_date_extra$Date_Extra$quarter(date)),
					1);
			case 'Week':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Mon, date));
			case 'Monday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Mon, date));
			case 'Tuesday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Tue, date));
			case 'Wednesday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Wed, date));
			case 'Thursday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Thu, date));
			case 'Friday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Fri, date));
			case 'Saturday':
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Sat, date));
			default:
				return A3(
					_justinmimbs$elm_date_extra$Date_Extra$fromCalendarDate,
					y,
					m,
					d + A2(_justinmimbs$elm_date_extra$Date_Extra$daysToPreviousDayOfWeek, _elm_lang$core$Date$Sun, date));
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$ceiling = F2(
	function (interval, date) {
		var floored = A2(_justinmimbs$elm_date_extra$Date_Extra$floor, interval, date);
		return _elm_lang$core$Native_Utils.eq(
			_elm_lang$core$Date$toTime(date),
			_elm_lang$core$Date$toTime(floored)) ? date : A3(_justinmimbs$elm_date_extra$Date_Extra$add, interval, 1, floored);
	});
var _justinmimbs$elm_date_extra$Date_Extra$range = F4(
	function (interval, step, start, end) {
		var next = function (date) {
			return (_elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$Date$toTime(date),
				_elm_lang$core$Date$toTime(end)) > -1) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
				{
					ctor: '_Tuple2',
					_0: date,
					_1: A3(
						_justinmimbs$elm_date_extra$Date_Extra$add,
						interval,
						A2(_elm_lang$core$Basics$max, 1, step),
						date)
				});
		};
		return A2(
			_justinmimbs$elm_date_extra$Date_Extra$unfold,
			next,
			A2(_justinmimbs$elm_date_extra$Date_Extra$ceiling, interval, start));
	});
var _justinmimbs$elm_date_extra$Date_Extra$fromIsoString = function (_p12) {
	return A2(
		_elm_lang$core$Maybe$map,
		_justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime,
		_justinmimbs$elm_date_extra$Date_Internal_Parse$offsetTimeFromIsoString(_p12));
};
var _justinmimbs$elm_date_extra$Date_Extra$fromSpec = F3(
	function (_p15, _p14, _p13) {
		var _p16 = _p15;
		var _p17 = _p14;
		var _p18 = _p13;
		return _justinmimbs$elm_date_extra$Date_Extra$fromOffsetTime(
			{ctor: '_Tuple2', _0: _p16._0, _1: _p18._0 + _p17._0});
	});
var _justinmimbs$elm_date_extra$Date_Extra$Offset = function (a) {
	return {ctor: 'Offset', _0: a};
};
var _justinmimbs$elm_date_extra$Date_Extra$utc = _justinmimbs$elm_date_extra$Date_Extra$Offset(
	_elm_lang$core$Maybe$Just(0));
var _justinmimbs$elm_date_extra$Date_Extra$offset = function (minutes) {
	return _justinmimbs$elm_date_extra$Date_Extra$Offset(
		_elm_lang$core$Maybe$Just(minutes));
};
var _justinmimbs$elm_date_extra$Date_Extra$local = _justinmimbs$elm_date_extra$Date_Extra$Offset(_elm_lang$core$Maybe$Nothing);
var _justinmimbs$elm_date_extra$Date_Extra$TimeMS = function (a) {
	return {ctor: 'TimeMS', _0: a};
};
var _justinmimbs$elm_date_extra$Date_Extra$noTime = _justinmimbs$elm_date_extra$Date_Extra$TimeMS(0);
var _justinmimbs$elm_date_extra$Date_Extra$atTime = F4(
	function (hh, mm, ss, ms) {
		return _justinmimbs$elm_date_extra$Date_Extra$TimeMS(
			A4(_justinmimbs$elm_date_extra$Date_Internal_Core$msFromTimeParts, hh, mm, ss, ms));
	});
var _justinmimbs$elm_date_extra$Date_Extra$DateMS = function (a) {
	return {ctor: 'DateMS', _0: a};
};
var _justinmimbs$elm_date_extra$Date_Extra$calendarDate = F3(
	function (y, m, d) {
		return _justinmimbs$elm_date_extra$Date_Extra$DateMS(
			A3(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromCalendarDate, y, m, d));
	});
var _justinmimbs$elm_date_extra$Date_Extra$ordinalDate = F2(
	function (y, d) {
		return _justinmimbs$elm_date_extra$Date_Extra$DateMS(
			A2(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromOrdinalDate, y, d));
	});
var _justinmimbs$elm_date_extra$Date_Extra$weekDate = F3(
	function (y, w, d) {
		return _justinmimbs$elm_date_extra$Date_Extra$DateMS(
			A3(_justinmimbs$elm_date_extra$Date_Internal_Core$unixTimeFromWeekDate, y, w, d));
	});
var _justinmimbs$elm_date_extra$Date_Extra$Sunday = {ctor: 'Sunday'};
var _justinmimbs$elm_date_extra$Date_Extra$Saturday = {ctor: 'Saturday'};
var _justinmimbs$elm_date_extra$Date_Extra$Friday = {ctor: 'Friday'};
var _justinmimbs$elm_date_extra$Date_Extra$Thursday = {ctor: 'Thursday'};
var _justinmimbs$elm_date_extra$Date_Extra$Wednesday = {ctor: 'Wednesday'};
var _justinmimbs$elm_date_extra$Date_Extra$Tuesday = {ctor: 'Tuesday'};
var _justinmimbs$elm_date_extra$Date_Extra$Monday = {ctor: 'Monday'};
var _justinmimbs$elm_date_extra$Date_Extra$Week = {ctor: 'Week'};
var _justinmimbs$elm_date_extra$Date_Extra$Quarter = {ctor: 'Quarter'};
var _justinmimbs$elm_date_extra$Date_Extra$Year = {ctor: 'Year'};
var _justinmimbs$elm_date_extra$Date_Extra$Month = {ctor: 'Month'};
var _justinmimbs$elm_date_extra$Date_Extra$Day = {ctor: 'Day'};
var _justinmimbs$elm_date_extra$Date_Extra$diff = F3(
	function (interval, date1, date2) {
		var diffMS = _elm_lang$core$Basics$floor(
			_elm_lang$core$Date$toTime(date2) - _elm_lang$core$Date$toTime(date1));
		var _p19 = interval;
		switch (_p19.ctor) {
			case 'Millisecond':
				return diffMS;
			case 'Second':
				return (diffMS / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerSecond) | 0;
			case 'Minute':
				return (diffMS / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerMinute) | 0;
			case 'Hour':
				return (diffMS / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerHour) | 0;
			case 'Day':
				return (diffMS / _justinmimbs$elm_date_extra$Date_Extra_Facts$msPerDay) | 0;
			case 'Month':
				return A2(_justinmimbs$elm_date_extra$Date_Extra$diffMonth, date1, date2);
			case 'Year':
				return (A2(_justinmimbs$elm_date_extra$Date_Extra$diffMonth, date1, date2) / 12) | 0;
			case 'Quarter':
				return (A2(_justinmimbs$elm_date_extra$Date_Extra$diffMonth, date1, date2) / 3) | 0;
			case 'Week':
				return (A3(_justinmimbs$elm_date_extra$Date_Extra$diff, _justinmimbs$elm_date_extra$Date_Extra$Day, date1, date2) / 7) | 0;
			default:
				var _p20 = _p19;
				return (A3(
					_justinmimbs$elm_date_extra$Date_Extra$diff,
					_justinmimbs$elm_date_extra$Date_Extra$Day,
					A2(_justinmimbs$elm_date_extra$Date_Extra$floor, _p20, date1),
					A2(_justinmimbs$elm_date_extra$Date_Extra$floor, _p20, date2)) / 7) | 0;
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$Hour = {ctor: 'Hour'};
var _justinmimbs$elm_date_extra$Date_Extra$Minute = {ctor: 'Minute'};
var _justinmimbs$elm_date_extra$Date_Extra$equalBy = F3(
	function (interval, date1, date2) {
		equalBy:
		while (true) {
			var _p21 = interval;
			switch (_p21.ctor) {
				case 'Millisecond':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$toTime(date1),
						_elm_lang$core$Date$toTime(date2));
				case 'Second':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$second(date1),
						_elm_lang$core$Date$second(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Minute, date1, date2);
				case 'Minute':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$minute(date1),
						_elm_lang$core$Date$minute(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Hour, date1, date2);
				case 'Hour':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$hour(date1),
						_elm_lang$core$Date$hour(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Day, date1, date2);
				case 'Day':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$day(date1),
						_elm_lang$core$Date$day(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Month, date1, date2);
				case 'Month':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$month(date1),
						_elm_lang$core$Date$month(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Year, date1, date2);
				case 'Year':
					return _elm_lang$core$Native_Utils.eq(
						_elm_lang$core$Date$year(date1),
						_elm_lang$core$Date$year(date2));
				case 'Quarter':
					return _elm_lang$core$Native_Utils.eq(
						_justinmimbs$elm_date_extra$Date_Extra$quarter(date1),
						_justinmimbs$elm_date_extra$Date_Extra$quarter(date2)) && A3(_justinmimbs$elm_date_extra$Date_Extra$equalBy, _justinmimbs$elm_date_extra$Date_Extra$Year, date1, date2);
				case 'Week':
					return _elm_lang$core$Native_Utils.eq(
						_justinmimbs$elm_date_extra$Date_Extra$weekNumber(date1),
						_justinmimbs$elm_date_extra$Date_Extra$weekNumber(date2)) && _elm_lang$core$Native_Utils.eq(
						_justinmimbs$elm_date_extra$Date_Extra$weekYear(date1),
						_justinmimbs$elm_date_extra$Date_Extra$weekYear(date2));
				default:
					var _p22 = _p21;
					var _v11 = _justinmimbs$elm_date_extra$Date_Extra$Day,
						_v12 = A2(_justinmimbs$elm_date_extra$Date_Extra$floor, _p22, date1),
						_v13 = A2(_justinmimbs$elm_date_extra$Date_Extra$floor, _p22, date2);
					interval = _v11;
					date1 = _v12;
					date2 = _v13;
					continue equalBy;
			}
		}
	});
var _justinmimbs$elm_date_extra$Date_Extra$Second = {ctor: 'Second'};
var _justinmimbs$elm_date_extra$Date_Extra$Millisecond = {ctor: 'Millisecond'};

var _gampleman$elm_visualization$Visualization_Scale_Time$tickFormat = F3(
	function (_p1, _p0, date) {
		var time = _elm_lang$core$Date$toTime(date);
		var significant = function (interval) {
			return _elm_lang$core$Native_Utils.cmp(
				_elm_lang$core$Date$toTime(
					A2(_justinmimbs$elm_date_extra$Date_Extra$floor, interval, date)),
				time) < 0;
		};
		return significant(_justinmimbs$elm_date_extra$Date_Extra$Second) ? A2(_justinmimbs$elm_date_extra$Date_Extra$toFormattedString, '.SSS', date) : (significant(_justinmimbs$elm_date_extra$Date_Extra$Minute) ? A2(_justinmimbs$elm_date_extra$Date_Extra$toFormattedString, ':ss', date) : (significant(_justinmimbs$elm_date_extra$Date_Extra$Hour) ? A2(_justinmimbs$elm_date_extra$Date_Extra$toFormattedString, 'hh:mm', date) : (significant(_justinmimbs$elm_date_extra$Date_Extra$Day) ? A2(_justinmimbs$elm_date_extra$Date_Extra$toFormattedString, 'hh a', date) : (significant(_justinmimbs$elm_date_extra$Date_Extra$Month) ? A2(_justinmimbs$elm_date_extra$Date_Extra$toFormattedString, 'dd MMM', date) : (significant(_justinmimbs$elm_date_extra$Date_Extra$Year) ? A2(_justinmimbs$elm_date_extra$Date_Extra$toFormattedString, 'MMMM', date) : A2(_justinmimbs$elm_date_extra$Date_Extra$toFormattedString, 'yyyy', date))))));
	});
var _gampleman$elm_visualization$Visualization_Scale_Time$timeLength = function (interval) {
	var _p2 = interval;
	switch (_p2.ctor) {
		case 'Millisecond':
			return 1;
		case 'Second':
			return 1000;
		case 'Minute':
			return 60 * 1000;
		case 'Hour':
			return (60 * 60) * 1000;
		case 'Day':
			return ((24 * 60) * 60) * 1000;
		case 'Month':
			return (((30 * 24) * 60) * 60) * 1000;
		case 'Year':
			return ((((365 * 30) * 24) * 60) * 60) * 1000;
		case 'Quarter':
			return ((((4 * 30) * 24) * 60) * 60) * 1000;
		case 'Week':
			return (((7 * 24) * 60) * 60) * 1000;
		default:
			return 0;
	}
};
var _gampleman$elm_visualization$Visualization_Scale_Time$findInterval = F2(
	function (target, intervals) {
		findInterval:
		while (true) {
			var _p3 = intervals;
			if (_p3.ctor === '[]') {
				return {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Year, _1: 1};
			} else {
				if (((_p3._0.ctor === '_Tuple2') && (_p3._1.ctor === '::')) && (_p3._1._0.ctor === '_Tuple2')) {
					var _p7 = _p3._1._0._1;
					var _p6 = _p3._0._1;
					var _p5 = _p3._1._0._0;
					var _p4 = _p3._0._0;
					var ratio_ = (_p7 * _gampleman$elm_visualization$Visualization_Scale_Time$timeLength(_p5)) / target;
					var ratio = target / (_p6 * _gampleman$elm_visualization$Visualization_Scale_Time$timeLength(_p4));
					if (_elm_lang$core$Native_Utils.cmp(ratio, ratio_) < 0) {
						return {ctor: '_Tuple2', _0: _p4, _1: _p6};
					} else {
						var _v2 = target,
							_v3 = {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _p5, _1: _p7},
							_1: _p3._1._1
						};
						target = _v2;
						intervals = _v3;
						continue findInterval;
					}
				} else {
					return _p3._0;
				}
			}
		}
	});
var _gampleman$elm_visualization$Visualization_Scale_Time$tickIntervals = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Second, _1: 1},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Second, _1: 5},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Second, _1: 15},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Second, _1: 30},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Minute, _1: 1},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Minute, _1: 5},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Minute, _1: 15},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Minute, _1: 30},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Hour, _1: 1},
									_1: {
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Hour, _1: 3},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Hour, _1: 6},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Hour, _1: 12},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Day, _1: 1},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Day, _1: 2},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Week, _1: 1},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Month, _1: 1},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Month, _1: 3},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: _justinmimbs$elm_date_extra$Date_Extra$Year, _1: 1},
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _gampleman$elm_visualization$Visualization_Scale_Time$interpolate = F2(
	function (a, b) {
		return A2(_gampleman$elm_visualization$Visualization_Interpolate$interpolateFloat, a, b);
	});
var _gampleman$elm_visualization$Visualization_Scale_Time$deinterpolate = _gampleman$elm_visualization$Visualization_Scale_Linear$deinterpolate;
var _gampleman$elm_visualization$Visualization_Scale_Time$rangeExtent = F2(
	function (d, r) {
		return r;
	});
var _gampleman$elm_visualization$Visualization_Scale_Time$toTime = function (_p8) {
	var _p9 = _p8;
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Date$toTime(_p9._0),
		_1: _elm_lang$core$Date$toTime(_p9._1)
	};
};
var _gampleman$elm_visualization$Visualization_Scale_Time$convert = F2(
	function (domain, range) {
		return A4(
			_gampleman$elm_visualization$Visualization_Scale_Internal$bimap,
			_gampleman$elm_visualization$Visualization_Scale_Time$toTime(domain),
			range,
			F3(
				function (d, r, v) {
					return A3(
						_gampleman$elm_visualization$Visualization_Scale_Time$deinterpolate,
						d,
						r,
						_elm_lang$core$Date$toTime(v));
				}),
			_gampleman$elm_visualization$Visualization_Interpolate$interpolateFloat);
	});
var _gampleman$elm_visualization$Visualization_Scale_Time$invert = F2(
	function (domain, range) {
		return A4(
			_gampleman$elm_visualization$Visualization_Scale_Internal$bimap,
			range,
			_gampleman$elm_visualization$Visualization_Scale_Time$toTime(domain),
			_gampleman$elm_visualization$Visualization_Scale_Time$deinterpolate,
			F3(
				function (d, r, v) {
					return _elm_lang$core$Date$fromTime(
						A3(_gampleman$elm_visualization$Visualization_Scale_Time$interpolate, d, r, v));
				}));
	});
var _gampleman$elm_visualization$Visualization_Scale_Time$ticks = F2(
	function (domain, count) {
		var _p10 = _gampleman$elm_visualization$Visualization_Scale_Time$toTime(domain);
		var start = _p10._0;
		var end = _p10._1;
		var target = _elm_lang$core$Basics$abs(start - end) / _elm_lang$core$Basics$toFloat(count);
		var _p11 = A2(_gampleman$elm_visualization$Visualization_Scale_Time$findInterval, target, _gampleman$elm_visualization$Visualization_Scale_Time$tickIntervals);
		var interval = _p11._0;
		var step = _p11._1;
		return A4(
			_justinmimbs$elm_date_extra$Date_Extra$range,
			interval,
			_elm_lang$core$Basics$round(step),
			_elm_lang$core$Date$fromTime(start),
			_elm_lang$core$Date$fromTime(end));
	});
var _gampleman$elm_visualization$Visualization_Scale_Time$nice = F2(
	function (domain, count) {
		var _p12 = _gampleman$elm_visualization$Visualization_Scale_Time$toTime(domain);
		var start = _p12._0;
		var end = _p12._1;
		var target = _elm_lang$core$Basics$abs(start - end) / _elm_lang$core$Basics$toFloat(count);
		var _p13 = A2(_gampleman$elm_visualization$Visualization_Scale_Time$findInterval, target, _gampleman$elm_visualization$Visualization_Scale_Time$tickIntervals);
		var interval = _p13._0;
		return {
			ctor: '_Tuple2',
			_0: A2(
				_justinmimbs$elm_date_extra$Date_Extra$floor,
				interval,
				_elm_lang$core$Date$fromTime(start)),
			_1: A2(
				_justinmimbs$elm_date_extra$Date_Extra$ceiling,
				interval,
				_elm_lang$core$Date$fromTime(end))
		};
	});

var _gampleman$elm_visualization$Visualization_Scale_Sequential$convert = F3(
	function (_p0, interpolator, x) {
		var _p1 = _p0;
		var _p2 = _p1._0;
		return interpolator((x - _p2) / (_p1._1 - _p2));
	});

var _gampleman$elm_visualization$Visualization_Scale_Quantize$nice = function (_p0) {
	return _elm_lang$core$Native_Utils.crash(
		'Visualization.Scale.Quantize',
		{
			start: {line: 100, column: 5},
			end: {line: 100, column: 16}
		})('not implemented');
};
var _gampleman$elm_visualization$Visualization_Scale_Quantize$tickFormat = function (_p1) {
	return _elm_lang$core$Native_Utils.crash(
		'Visualization.Scale.Quantize',
		{
			start: {line: 95, column: 5},
			end: {line: 95, column: 16}
		})('not implemented');
};
var _gampleman$elm_visualization$Visualization_Scale_Quantize$ticks = function (_p2) {
	return _elm_lang$core$Native_Utils.crash(
		'Visualization.Scale.Quantize',
		{
			start: {line: 90, column: 5},
			end: {line: 90, column: 16}
		})('not implemented');
};
var _gampleman$elm_visualization$Visualization_Scale_Quantize$computeDomain = F2(
	function (_p3, tail) {
		var _p4 = _p3;
		var _p6 = _p4._0;
		var _p5 = _p4._1;
		var l = _elm_lang$core$List$length(tail);
		var step = (_p5 - _p6) / _elm_lang$core$Basics$toFloat(l + 1);
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{
				ctor: '::',
				_0: 0,
				_1: {ctor: '[]'}
			},
			_elm_lang$core$List$tail(
				A3(_gampleman$elm_visualization$Visualization_List$range, _p6, _p5, step)));
	});
var _gampleman$elm_visualization$Visualization_Scale_Quantize$convert = F3(
	function (domain, _p7, val) {
		var _p8 = _p7;
		var _p15 = _p8._1;
		var _p14 = _p8._0;
		var last = F2(
			function (head, tail) {
				last:
				while (true) {
					var _p9 = tail;
					if (_p9.ctor === '[]') {
						return head;
					} else {
						var _v3 = _p9._0,
							_v4 = _p9._1;
						head = _v3;
						tail = _v4;
						continue last;
					}
				}
			});
		var helper = F2(
			function (dom, range) {
				helper:
				while (true) {
					var _p10 = dom;
					if (_p10.ctor === '[]') {
						var _p11 = range;
						if (_p11.ctor === '[]') {
							return A2(last, _p14, _p15);
						} else {
							return _p11._0;
						}
					} else {
						var _p12 = range;
						if (_p12.ctor === '[]') {
							return _elm_lang$core$Native_Utils.crashCase(
								'Visualization.Scale.Quantize',
								{
									start: {line: 45, column: 21},
									end: {line: 53, column: 34}
								},
								_p12)('Invariant breached: ran out of range');
						} else {
							if (_elm_lang$core$Native_Utils.cmp(val, _p10._0) > 0) {
								var _v8 = _p10._1,
									_v9 = _p12._1;
								dom = _v8;
								range = _v9;
								continue helper;
							} else {
								return _p12._0;
							}
						}
					}
				}
			});
		return A2(
			helper,
			A2(_gampleman$elm_visualization$Visualization_Scale_Quantize$computeDomain, domain, _p15),
			{ctor: '::', _0: _p14, _1: _p15});
	});
var _gampleman$elm_visualization$Visualization_Scale_Quantize$invertExtent = F3(
	function (_p17, _p16, val) {
		var _p18 = _p17;
		var _p25 = _p18._0;
		var _p24 = _p18._1;
		var _p19 = _p16;
		var _p23 = _p19._1;
		var helper = F2(
			function (domain, range) {
				helper:
				while (true) {
					var _p20 = range;
					if (_p20.ctor === '[]') {
						return _elm_lang$core$Maybe$Nothing;
					} else {
						if (_elm_lang$core$Native_Utils.eq(_p20._0, val)) {
							var _p21 = domain;
							if ((_p21.ctor === '::') && (_p21._1.ctor === '::')) {
								return _elm_lang$core$Maybe$Just(
									{ctor: '_Tuple2', _0: _p21._0, _1: _p21._1._0});
							} else {
								return _elm_lang$core$Maybe$Nothing;
							}
						} else {
							var _p22 = domain;
							if (_p22.ctor === '[]') {
								return _elm_lang$core$Maybe$Nothing;
							} else {
								var _v15 = _p22._1,
									_v16 = _p20._1;
								domain = _v15;
								range = _v16;
								continue helper;
							}
						}
					}
				}
			});
		var domain = A2(
			_gampleman$elm_visualization$Visualization_Scale_Quantize$computeDomain,
			{ctor: '_Tuple2', _0: _p25, _1: _p24},
			_p23);
		return A2(
			helper,
			{
				ctor: '::',
				_0: _p25,
				_1: A2(
					_elm_lang$core$Basics_ops['++'],
					domain,
					{
						ctor: '::',
						_0: _p24,
						_1: {ctor: '[]'}
					})
			},
			{ctor: '::', _0: _p19._0, _1: _p23});
	});
var _gampleman$elm_visualization$Visualization_Scale_Quantize$rangeExtent = F2(
	function (_p26, range) {
		var _p27 = _p26;
		var _p29 = _p27._0;
		var _p28 = _p27._1;
		return {
			ctor: '_Tuple2',
			_0: A3(
				_gampleman$elm_visualization$Visualization_Scale_Quantize$convert,
				{ctor: '_Tuple2', _0: _p29, _1: _p28},
				range,
				_p29),
			_1: A3(
				_gampleman$elm_visualization$Visualization_Scale_Quantize$convert,
				{ctor: '_Tuple2', _0: _p29, _1: _p28},
				range,
				_p28)
		};
	});

var _gampleman$elm_visualization$Visualization_Scale$tickFormat = function (_p0) {
	var _p1 = _p0;
	var _p2 = _p1._0;
	return _p2.tickFormat(_p2.domain);
};
var _gampleman$elm_visualization$Visualization_Scale$ticks = F2(
	function (_p3, count) {
		var _p4 = _p3;
		var _p5 = _p4._0;
		return A2(_p5.ticks, _p5.domain, count);
	});
var _gampleman$elm_visualization$Visualization_Scale$rangeExtent = function (_p6) {
	var _p7 = _p6;
	var _p8 = _p7._0;
	return A2(_p8.rangeExtent, _p8.domain, _p8.range);
};
var _gampleman$elm_visualization$Visualization_Scale$range = function (_p9) {
	var _p10 = _p9;
	return _p10._0.range;
};
var _gampleman$elm_visualization$Visualization_Scale$domain = function (_p11) {
	var _p12 = _p11;
	return _p12._0.domain;
};
var _gampleman$elm_visualization$Visualization_Scale$invertExtent = F2(
	function (_p13, value) {
		var _p14 = _p13;
		var _p15 = _p14._0;
		return A3(_p15.invertExtent, _p15.domain, _p15.range, value);
	});
var _gampleman$elm_visualization$Visualization_Scale$invert = F2(
	function (_p16, value) {
		var _p17 = _p16;
		var _p18 = _p17._0;
		return A3(_p18.invert, _p18.domain, _p18.range, value);
	});
var _gampleman$elm_visualization$Visualization_Scale$convert = F2(
	function (_p19, value) {
		var _p20 = _p19;
		var _p21 = _p20._0;
		return A3(_p21.convert, _p21.domain, _p21.range, value);
	});
var _gampleman$elm_visualization$Visualization_Scale$Scale = function (a) {
	return {ctor: 'Scale', _0: a};
};
var _gampleman$elm_visualization$Visualization_Scale$linear = F2(
	function (domain, range) {
		return _gampleman$elm_visualization$Visualization_Scale$Scale(
			{domain: domain, range: range, convert: _gampleman$elm_visualization$Visualization_Scale_Linear$convert, invert: _gampleman$elm_visualization$Visualization_Scale_Linear$invert, ticks: _gampleman$elm_visualization$Visualization_Scale_Linear$ticks, tickFormat: _gampleman$elm_visualization$Visualization_Scale_Linear$tickFormat, nice: _gampleman$elm_visualization$Visualization_Scale_Linear$nice, rangeExtent: _gampleman$elm_visualization$Visualization_Scale_Linear$rangeExtent});
	});
var _gampleman$elm_visualization$Visualization_Scale$identity = A2(
	_gampleman$elm_visualization$Visualization_Scale$linear,
	{ctor: '_Tuple2', _0: 0, _1: 1},
	{ctor: '_Tuple2', _0: 0, _1: 1});
var _gampleman$elm_visualization$Visualization_Scale$log = F3(
	function (base, domain, range) {
		return _gampleman$elm_visualization$Visualization_Scale$Scale(
			{
				domain: domain,
				range: range,
				convert: _gampleman$elm_visualization$Visualization_Scale_Log$convert,
				invert: _gampleman$elm_visualization$Visualization_Scale_Log$invert,
				ticks: _gampleman$elm_visualization$Visualization_Scale_Log$ticks(base),
				tickFormat: _gampleman$elm_visualization$Visualization_Scale_Log$tickFormat,
				nice: _gampleman$elm_visualization$Visualization_Scale_Log$nice(base),
				rangeExtent: _gampleman$elm_visualization$Visualization_Scale_Log$rangeExtent
			});
	});
var _gampleman$elm_visualization$Visualization_Scale$time = F2(
	function (domain, range) {
		return _gampleman$elm_visualization$Visualization_Scale$Scale(
			{domain: domain, range: range, convert: _gampleman$elm_visualization$Visualization_Scale_Time$convert, invert: _gampleman$elm_visualization$Visualization_Scale_Time$invert, ticks: _gampleman$elm_visualization$Visualization_Scale_Time$ticks, tickFormat: _gampleman$elm_visualization$Visualization_Scale_Time$tickFormat, nice: _gampleman$elm_visualization$Visualization_Scale_Time$nice, rangeExtent: _gampleman$elm_visualization$Visualization_Scale_Time$rangeExtent});
	});
var _gampleman$elm_visualization$Visualization_Scale$sequential = F2(
	function (domain, interpolator) {
		return _gampleman$elm_visualization$Visualization_Scale$Scale(
			{domain: domain, range: interpolator, convert: _gampleman$elm_visualization$Visualization_Scale_Sequential$convert});
	});
var _gampleman$elm_visualization$Visualization_Scale$quantize = F2(
	function (domain, range) {
		return _gampleman$elm_visualization$Visualization_Scale$Scale(
			{domain: domain, range: range, convert: _gampleman$elm_visualization$Visualization_Scale_Quantize$convert, invertExtent: _gampleman$elm_visualization$Visualization_Scale_Quantize$invertExtent, ticks: _gampleman$elm_visualization$Visualization_Scale_Quantize$ticks, tickFormat: _gampleman$elm_visualization$Visualization_Scale_Quantize$tickFormat, nice: _gampleman$elm_visualization$Visualization_Scale_Quantize$nice, rangeExtent: _gampleman$elm_visualization$Visualization_Scale_Quantize$rangeExtent});
	});
var _gampleman$elm_visualization$Visualization_Scale$clamp = function (_p22) {
	var _p23 = _p22;
	var convert_ = F3(
		function (_p24, range, value) {
			var _p25 = _p24;
			var _p27 = _p25._0;
			var _p26 = _p25._1;
			return A3(
				_p23._0.convert,
				{ctor: '_Tuple2', _0: _p27, _1: _p26},
				range,
				A3(
					_elm_lang$core$Basics$clamp,
					A2(_elm_lang$core$Basics$min, _p27, _p26),
					A2(_elm_lang$core$Basics$max, _p27, _p26),
					value));
		});
	return _gampleman$elm_visualization$Visualization_Scale$Scale(
		_elm_lang$core$Native_Utils.update(
			_p23._0,
			{convert: convert_}));
};
var _gampleman$elm_visualization$Visualization_Scale$nice = F2(
	function (_p28, count) {
		var _p29 = _p28;
		return _gampleman$elm_visualization$Visualization_Scale$Scale(
			_elm_lang$core$Native_Utils.update(
				_p29._0,
				{
					domain: A2(_p29._0.nice, _p29._0.domain, count)
				}));
	});

var _gampleman$elm_visualization$Visualization_Axis$Options = F7(
	function (a, b, c, d, e, f, g) {
		return {orientation: a, ticks: b, tickFormat: c, tickCount: d, tickSizeInner: e, tickSizeOuter: f, tickPadding: g};
	});
var _gampleman$elm_visualization$Visualization_Axis$Bottom = {ctor: 'Bottom'};
var _gampleman$elm_visualization$Visualization_Axis$Top = {ctor: 'Top'};
var _gampleman$elm_visualization$Visualization_Axis$Right = {ctor: 'Right'};
var _gampleman$elm_visualization$Visualization_Axis$Left = {ctor: 'Left'};
var _gampleman$elm_visualization$Visualization_Axis$defaultOptions = {orientation: _gampleman$elm_visualization$Visualization_Axis$Left, ticks: _elm_lang$core$Maybe$Nothing, tickFormat: _elm_lang$core$Maybe$Nothing, tickCount: 10, tickSizeInner: 6, tickSizeOuter: 6, tickPadding: 3};
var _gampleman$elm_visualization$Visualization_Axis$axis = F2(
	function (opts, scale) {
		var verticalAttrs = {
			ctor: '_Tuple6',
			_0: function (_p0) {
				return _elm_lang$svg$Svg_Attributes$y(
					_elm_lang$core$Basics$toString(_p0));
			},
			_1: function (_p1) {
				return _elm_lang$svg$Svg_Attributes$x(
					_elm_lang$core$Basics$toString(_p1));
			},
			_2: function (_p2) {
				return _elm_lang$svg$Svg_Attributes$y1(
					_elm_lang$core$Basics$toString(_p2));
			},
			_3: function (_p3) {
				return _elm_lang$svg$Svg_Attributes$y2(
					_elm_lang$core$Basics$toString(_p3));
			},
			_4: function (_p4) {
				return _elm_lang$svg$Svg_Attributes$x1(
					_elm_lang$core$Basics$toString(_p4));
			},
			_5: function (_p5) {
				return _elm_lang$svg$Svg_Attributes$x2(
					_elm_lang$core$Basics$toString(_p5));
			}
		};
		var horizontalAttrs = {
			ctor: '_Tuple6',
			_0: function (_p6) {
				return _elm_lang$svg$Svg_Attributes$x(
					_elm_lang$core$Basics$toString(_p6));
			},
			_1: function (_p7) {
				return _elm_lang$svg$Svg_Attributes$y(
					_elm_lang$core$Basics$toString(_p7));
			},
			_2: function (_p8) {
				return _elm_lang$svg$Svg_Attributes$x1(
					_elm_lang$core$Basics$toString(_p8));
			},
			_3: function (_p9) {
				return _elm_lang$svg$Svg_Attributes$x2(
					_elm_lang$core$Basics$toString(_p9));
			},
			_4: function (_p10) {
				return _elm_lang$svg$Svg_Attributes$y1(
					_elm_lang$core$Basics$toString(_p10));
			},
			_5: function (_p11) {
				return _elm_lang$svg$Svg_Attributes$y2(
					_elm_lang$core$Basics$toString(_p11));
			}
		};
		var position = _gampleman$elm_visualization$Visualization_Scale$convert(scale);
		var translateX = function (point) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'translate(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						position(point)),
					', 0)'));
		};
		var translateY = function (point) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'translate(0, ',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						position(point)),
					')'));
		};
		var _p12 = function () {
			var _p13 = opts.orientation;
			switch (_p13.ctor) {
				case 'Left':
					return {ctor: '_Tuple5', _0: -1, _1: '0.32em', _2: 'end', _3: translateY, _4: horizontalAttrs};
				case 'Top':
					return {ctor: '_Tuple5', _0: -1, _1: '0em', _2: 'middle', _3: translateX, _4: verticalAttrs};
				case 'Right':
					return {ctor: '_Tuple5', _0: 1, _1: '0.32em', _2: 'start', _3: translateY, _4: horizontalAttrs};
				default:
					return {ctor: '_Tuple5', _0: 1, _1: '0.71em', _2: 'middle', _3: translateX, _4: verticalAttrs};
			}
		}();
		var k = _p12._0;
		var dy_ = _p12._1;
		var textAnchorPosition = _p12._2;
		var translate = _p12._3;
		var x = _p12._4._0;
		var y = _p12._4._1;
		var x1 = _p12._4._2;
		var x2 = _p12._4._3;
		var y1 = _p12._4._4;
		var y2 = _p12._4._5;
		var rangeExtent = _gampleman$elm_visualization$Visualization_Scale$rangeExtent(scale);
		var range0 = _elm_lang$core$Tuple$first(rangeExtent) + 0.5;
		var range1 = _elm_lang$core$Tuple$second(rangeExtent) + 0.5;
		var domainLine = (_elm_lang$core$Native_Utils.eq(opts.orientation, _gampleman$elm_visualization$Visualization_Axis$Left) || _elm_lang$core$Native_Utils.eq(opts.orientation, _gampleman$elm_visualization$Visualization_Axis$Right)) ? A2(
			_elm_lang$core$Basics_ops['++'],
			'M',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(k * opts.tickSizeOuter),
				A2(
					_elm_lang$core$Basics_ops['++'],
					',',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(range0),
						A2(
							_elm_lang$core$Basics_ops['++'],
							'H0.5V',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(range1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									'H',
									_elm_lang$core$Basics$toString(k * opts.tickSizeOuter)))))))) : A2(
			_elm_lang$core$Basics_ops['++'],
			'M',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(range0),
				A2(
					_elm_lang$core$Basics_ops['++'],
					',',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(k * opts.tickSizeOuter),
						A2(
							_elm_lang$core$Basics_ops['++'],
							'V0.5H',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(range1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									'V',
									_elm_lang$core$Basics$toString(k * opts.tickSizeOuter))))))));
		var spacing = A2(_elm_lang$core$Basics$max, opts.tickSizeInner, 0) + opts.tickPadding;
		var format = A2(
			_elm_lang$core$Maybe$withDefault,
			A2(_gampleman$elm_visualization$Visualization_Scale$tickFormat, scale, opts.tickCount),
			opts.tickFormat);
		var drawTick = function (tick) {
			return A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$class('tick'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$transform(
							translate(tick)),
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$line,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('#000'),
							_1: {
								ctor: '::',
								_0: x2(k * opts.tickSizeInner),
								_1: {
									ctor: '::',
									_0: y1(0.5),
									_1: {
										ctor: '::',
										_0: y2(0.5),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$text_,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('#000'),
								_1: {
									ctor: '::',
									_0: x(k * spacing),
									_1: {
										ctor: '::',
										_0: y(0.5),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$dy(dy_),
											_1: {ctor: '[]'}
										}
									}
								}
							},
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg$text(
									format(tick)),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				});
		};
		var ticks = A2(
			_elm_lang$core$Maybe$withDefault,
			A2(_gampleman$elm_visualization$Visualization_Scale$ticks, scale, opts.tickCount),
			opts.ticks);
		return A2(
			_elm_lang$svg$Svg$g,
			{
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$fill('none'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$fontSize('10'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$fontFamily('sans-serif'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$textAnchor(textAnchorPosition),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$path,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$class('domain'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$stroke('#000'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$d(domainLine),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: A2(_elm_lang$core$List$map, drawTick, ticks)
			});
	});

var _gampleman$elm_visualization$Visualization_Path$mod = F2(
	function (a, b) {
		var frac = a / b;
		return (frac - _elm_lang$core$Basics$toFloat(
			_elm_lang$core$Basics$truncate(frac))) * b;
	});
var _gampleman$elm_visualization$Visualization_Path$stringify = F2(
	function (item, _p0) {
		var _p1 = _p0;
		var _p19 = _p1._4;
		var _p18 = _p1._2;
		var _p17 = _p1._3;
		var _p16 = _p1._1;
		var _p15 = _p1._0;
		var _p14 = _p1._5;
		var boolToFloat = function (b) {
			return b ? 1 : 0;
		};
		var epsilon = 1.0e-6;
		var append = F3(
			function (cmd, values, str) {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					str,
					A2(
						_elm_lang$core$Basics_ops['++'],
						cmd,
						A2(
							_elm_lang$core$String$join,
							',',
							A2(_elm_lang$core$List$map, _elm_lang$core$Basics$toString, values))));
			});
		var stringifyArc = F5(
			function (x1_, y1_, x2_, y2_, radius) {
				var y21 = y2_ - y1_;
				var x21 = x2_ - x1_;
				var l21_2 = Math.pow(x21, 2) + Math.pow(y21, 2);
				var l21 = _elm_lang$core$Basics$sqrt(l21_2);
				var y0_ = _p19;
				var y01 = y0_ - y1_;
				var y20 = y2_ - y0_;
				var x0_ = _p17;
				var x01 = x0_ - x1_;
				var l01_2 = Math.pow(x01, 2) + Math.pow(y01, 2);
				var l01 = _elm_lang$core$Basics$sqrt(l01_2);
				var x20 = x2_ - x0_;
				var l20_2 = Math.pow(x20, 2) + Math.pow(y20, 2);
				var r = _elm_lang$core$Basics$abs(radius);
				var l = r * _elm_lang$core$Basics$tan(
					(_elm_lang$core$Basics$pi - _elm_lang$core$Basics$acos(((l21_2 + l01_2) - l20_2) / ((2 * l21) * l01))) / 2);
				var t01 = l / l01;
				var str_ = (_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Basics$abs(t01 - 1),
					epsilon) > 0) ? A3(
					append,
					'L',
					{
						ctor: '::',
						_0: x1_ + (t01 * x01),
						_1: {
							ctor: '::',
							_0: y1_ + (t01 * y01),
							_1: {ctor: '[]'}
						}
					},
					_p15) : _p15;
				var t21 = l / l21;
				return _p14 ? {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'M',
						{
							ctor: '::',
							_0: x1_,
							_1: {
								ctor: '::',
								_0: y1_,
								_1: {ctor: '[]'}
							}
						},
						_p15),
					_1: _p16,
					_2: _p18,
					_3: x1_,
					_4: y1_,
					_5: false
				} : ((_elm_lang$core$Native_Utils.cmp(l01_2, epsilon) < 0) ? {ctor: '_Tuple6', _0: _p15, _1: _p16, _2: _p18, _3: _p17, _4: _p19, _5: _p14} : (((!(_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Basics$abs((y01 * x21) - (y21 * x01)),
					epsilon) > 0)) || _elm_lang$core$Native_Utils.eq(r, 0)) ? {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'L',
						{
							ctor: '::',
							_0: x1_,
							_1: {
								ctor: '::',
								_0: y1_,
								_1: {ctor: '[]'}
							}
						},
						_p15),
					_1: _p16,
					_2: _p18,
					_3: x1_,
					_4: y1_,
					_5: false
				} : {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'A',
						{
							ctor: '::',
							_0: r,
							_1: {
								ctor: '::',
								_0: r,
								_1: {
									ctor: '::',
									_0: 0,
									_1: {
										ctor: '::',
										_0: 0,
										_1: {
											ctor: '::',
											_0: (_elm_lang$core$Native_Utils.cmp(y01 * x20, x01 * y20) > 0) ? 1 : 0,
											_1: {
												ctor: '::',
												_0: x1_ + (t21 * x21),
												_1: {
													ctor: '::',
													_0: y1_ + (t21 * y21),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						},
						str_),
					_1: _p16,
					_2: _p18,
					_3: x1_ + (t21 * x21),
					_4: y1_ + (t21 * y21),
					_5: false
				}));
			});
		var stringifyArcCustom = F6(
			function (x, y, radius, a0, a1, ccw) {
				var da = ccw ? (a0 - a1) : (a1 - a0);
				var tau = 2 * _elm_lang$core$Basics$pi;
				var cw = boolToFloat(!ccw);
				var r = _elm_lang$core$Basics$abs(radius);
				var dx = r * _elm_lang$core$Basics$cos(a0);
				var x0_ = x + dx;
				var dy = r * _elm_lang$core$Basics$sin(a0);
				var y0_ = y + dy;
				var str_ = _p14 ? A3(
					append,
					'M',
					{
						ctor: '::',
						_0: x0_,
						_1: {
							ctor: '::',
							_0: y0_,
							_1: {ctor: '[]'}
						}
					},
					_p15) : (((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Basics$abs(_p17 - x0_),
					epsilon) > 0) || (_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Basics$abs(_p19 - y0_),
					epsilon) > 0)) ? A3(
					append,
					'L',
					{
						ctor: '::',
						_0: x0_,
						_1: {
							ctor: '::',
							_0: y0_,
							_1: {ctor: '[]'}
						}
					},
					_p15) : _p15);
				if (_elm_lang$core$Native_Utils.eq(r, 0)) {
					return {ctor: '_Tuple6', _0: str_, _1: _p16, _2: _p18, _3: _p17, _4: _p19, _5: _p14};
				} else {
					if (_elm_lang$core$Native_Utils.cmp(da, tau - epsilon) > 0) {
						return {
							ctor: '_Tuple6',
							_0: A3(
								append,
								'A',
								{
									ctor: '::',
									_0: r,
									_1: {
										ctor: '::',
										_0: r,
										_1: {
											ctor: '::',
											_0: 0,
											_1: {
												ctor: '::',
												_0: 1,
												_1: {
													ctor: '::',
													_0: cw,
													_1: {
														ctor: '::',
														_0: x0_,
														_1: {
															ctor: '::',
															_0: y0_,
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								},
								A3(
									append,
									'A',
									{
										ctor: '::',
										_0: r,
										_1: {
											ctor: '::',
											_0: r,
											_1: {
												ctor: '::',
												_0: 0,
												_1: {
													ctor: '::',
													_0: 1,
													_1: {
														ctor: '::',
														_0: cw,
														_1: {
															ctor: '::',
															_0: x - dx,
															_1: {
																ctor: '::',
																_0: y - dy,
																_1: {ctor: '[]'}
															}
														}
													}
												}
											}
										}
									},
									str_)),
							_1: _p16,
							_2: _p18,
							_3: x0_,
							_4: y0_,
							_5: false
						};
					} else {
						var da_ = (_elm_lang$core$Native_Utils.cmp(da, 0) < 0) ? (A2(_gampleman$elm_visualization$Visualization_Path$mod, da, tau) + tau) : da;
						return {
							ctor: '_Tuple6',
							_0: A3(
								append,
								'A',
								{
									ctor: '::',
									_0: r,
									_1: {
										ctor: '::',
										_0: r,
										_1: {
											ctor: '::',
											_0: 0,
											_1: {
												ctor: '::',
												_0: boolToFloat(
													_elm_lang$core$Native_Utils.cmp(da_, _elm_lang$core$Basics$pi) > -1),
												_1: {
													ctor: '::',
													_0: cw,
													_1: {
														ctor: '::',
														_0: x + (r * _elm_lang$core$Basics$cos(a1)),
														_1: {
															ctor: '::',
															_0: y + (r * _elm_lang$core$Basics$sin(a1)),
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								},
								str_),
							_1: _p16,
							_2: _p18,
							_3: x + (r * _elm_lang$core$Basics$cos(a1)),
							_4: y + (r * _elm_lang$core$Basics$sin(a1)),
							_5: false
						};
					}
				}
			});
		var _p2 = item;
		switch (_p2.ctor) {
			case 'Move':
				var _p4 = _p2._0._1;
				var _p3 = _p2._0._0;
				return {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'M',
						{
							ctor: '::',
							_0: _p3,
							_1: {
								ctor: '::',
								_0: _p4,
								_1: {ctor: '[]'}
							}
						},
						_p15),
					_1: _p3,
					_2: _p4,
					_3: _p3,
					_4: _p4,
					_5: false
				};
			case 'Close':
				return _p14 ? {ctor: '_Tuple6', _0: _p15, _1: _p16, _2: _p18, _3: _p17, _4: _p19, _5: _p14} : {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'Z',
						{ctor: '[]'},
						_p15),
					_1: _p16,
					_2: _p18,
					_3: _p16,
					_4: _p18,
					_5: false
				};
			case 'Line':
				var _p6 = _p2._0._1;
				var _p5 = _p2._0._0;
				return {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'L',
						{
							ctor: '::',
							_0: _p5,
							_1: {
								ctor: '::',
								_0: _p6,
								_1: {ctor: '[]'}
							}
						},
						_p15),
					_1: _p16,
					_2: _p18,
					_3: _p5,
					_4: _p6,
					_5: false
				};
			case 'QuadraticCurve':
				var _p8 = _p2._1._1;
				var _p7 = _p2._1._0;
				return {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'Q',
						{
							ctor: '::',
							_0: _p2._0._0,
							_1: {
								ctor: '::',
								_0: _p2._0._1,
								_1: {
									ctor: '::',
									_0: _p7,
									_1: {
										ctor: '::',
										_0: _p8,
										_1: {ctor: '[]'}
									}
								}
							}
						},
						_p15),
					_1: _p16,
					_2: _p18,
					_3: _p7,
					_4: _p8,
					_5: false
				};
			case 'BezierCurve':
				var _p10 = _p2._2._1;
				var _p9 = _p2._2._0;
				return {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'C',
						{
							ctor: '::',
							_0: _p2._0._0,
							_1: {
								ctor: '::',
								_0: _p2._0._1,
								_1: {
									ctor: '::',
									_0: _p2._1._0,
									_1: {
										ctor: '::',
										_0: _p2._1._1,
										_1: {
											ctor: '::',
											_0: _p9,
											_1: {
												ctor: '::',
												_0: _p10,
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						},
						_p15),
					_1: _p16,
					_2: _p18,
					_3: _p9,
					_4: _p10,
					_5: false
				};
			case 'Arc':
				return A5(stringifyArc, _p2._0._0, _p2._0._1, _p2._1._0, _p2._1._1, _p2._2);
			case 'ArcCustom':
				return A6(stringifyArcCustom, _p2._0._0, _p2._0._1, _p2._1, _p2._2, _p2._3, _p2._4);
			default:
				var _p13 = _p2._0._1;
				var _p12 = _p2._0._0;
				var _p11 = _p2._1._0;
				return {
					ctor: '_Tuple6',
					_0: A3(
						append,
						'Z',
						{ctor: '[]'},
						A3(
							append,
							'h',
							{
								ctor: '::',
								_0: 0 - _p11,
								_1: {ctor: '[]'}
							},
							A3(
								append,
								'v',
								{
									ctor: '::',
									_0: _p2._1._1,
									_1: {ctor: '[]'}
								},
								A3(
									append,
									'h',
									{
										ctor: '::',
										_0: _p11,
										_1: {ctor: '[]'}
									},
									A3(
										append,
										'M',
										{
											ctor: '::',
											_0: _p12,
											_1: {
												ctor: '::',
												_0: _p13,
												_1: {ctor: '[]'}
											}
										},
										_p15))))),
					_1: _p12,
					_2: _p13,
					_3: _p12,
					_4: _p13,
					_5: false
				};
		}
	});
var _gampleman$elm_visualization$Visualization_Path$toAttrString = function (path) {
	var _p20 = A3(
		_elm_lang$core$List$foldl,
		_gampleman$elm_visualization$Visualization_Path$stringify,
		{ctor: '_Tuple6', _0: '', _1: 0, _2: 0, _3: 0, _4: 0, _5: true},
		path);
	var result = _p20._0;
	return result;
};
var _gampleman$elm_visualization$Visualization_Path$begin = {ctor: '[]'};
var _gampleman$elm_visualization$Visualization_Path$push = F2(
	function (el, list) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			list,
			{
				ctor: '::',
				_0: el,
				_1: {ctor: '[]'}
			});
	});
var _gampleman$elm_visualization$Visualization_Path$Rect = F2(
	function (a, b) {
		return {ctor: 'Rect', _0: a, _1: b};
	});
var _gampleman$elm_visualization$Visualization_Path$rect = F4(
	function (x, y, w, h) {
		return _gampleman$elm_visualization$Visualization_Path$push(
			A2(
				_gampleman$elm_visualization$Visualization_Path$Rect,
				{ctor: '_Tuple2', _0: x, _1: y},
				{ctor: '_Tuple2', _0: w, _1: h}));
	});
var _gampleman$elm_visualization$Visualization_Path$ArcCustom = F5(
	function (a, b, c, d, e) {
		return {ctor: 'ArcCustom', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _gampleman$elm_visualization$Visualization_Path$arc = F6(
	function (x, y, radius, startAngle, endAngle, anticlockwise) {
		return _gampleman$elm_visualization$Visualization_Path$push(
			A5(
				_gampleman$elm_visualization$Visualization_Path$ArcCustom,
				{ctor: '_Tuple2', _0: x, _1: y},
				radius,
				startAngle,
				endAngle,
				anticlockwise));
	});
var _gampleman$elm_visualization$Visualization_Path$Arc = F3(
	function (a, b, c) {
		return {ctor: 'Arc', _0: a, _1: b, _2: c};
	});
var _gampleman$elm_visualization$Visualization_Path$arcTo = F5(
	function (x1, y1, x2, y2, radius) {
		return _gampleman$elm_visualization$Visualization_Path$push(
			A3(
				_gampleman$elm_visualization$Visualization_Path$Arc,
				{ctor: '_Tuple2', _0: x1, _1: y1},
				{ctor: '_Tuple2', _0: x2, _1: y2},
				radius));
	});
var _gampleman$elm_visualization$Visualization_Path$BezierCurve = F3(
	function (a, b, c) {
		return {ctor: 'BezierCurve', _0: a, _1: b, _2: c};
	});
var _gampleman$elm_visualization$Visualization_Path$bezierCurveTo = F6(
	function (cpx1, cpy1, cpx2, cpy2, x, y) {
		return _gampleman$elm_visualization$Visualization_Path$push(
			A3(
				_gampleman$elm_visualization$Visualization_Path$BezierCurve,
				{ctor: '_Tuple2', _0: cpx1, _1: cpy1},
				{ctor: '_Tuple2', _0: cpx2, _1: cpy2},
				{ctor: '_Tuple2', _0: x, _1: y}));
	});
var _gampleman$elm_visualization$Visualization_Path$QuadraticCurve = F2(
	function (a, b) {
		return {ctor: 'QuadraticCurve', _0: a, _1: b};
	});
var _gampleman$elm_visualization$Visualization_Path$quadraticCurveTo = F4(
	function (cpx, cpy, x, y) {
		return _gampleman$elm_visualization$Visualization_Path$push(
			A2(
				_gampleman$elm_visualization$Visualization_Path$QuadraticCurve,
				{ctor: '_Tuple2', _0: cpx, _1: cpy},
				{ctor: '_Tuple2', _0: x, _1: y}));
	});
var _gampleman$elm_visualization$Visualization_Path$Line = function (a) {
	return {ctor: 'Line', _0: a};
};
var _gampleman$elm_visualization$Visualization_Path$lineTo = F2(
	function (x, y) {
		return _gampleman$elm_visualization$Visualization_Path$push(
			_gampleman$elm_visualization$Visualization_Path$Line(
				{ctor: '_Tuple2', _0: x, _1: y}));
	});
var _gampleman$elm_visualization$Visualization_Path$Close = {ctor: 'Close'};
var _gampleman$elm_visualization$Visualization_Path$close = _gampleman$elm_visualization$Visualization_Path$push(_gampleman$elm_visualization$Visualization_Path$Close);
var _gampleman$elm_visualization$Visualization_Path$Move = function (a) {
	return {ctor: 'Move', _0: a};
};
var _gampleman$elm_visualization$Visualization_Path$moveTo = F2(
	function (x, y) {
		return _gampleman$elm_visualization$Visualization_Path$push(
			_gampleman$elm_visualization$Visualization_Path$Move(
				{ctor: '_Tuple2', _0: x, _1: y}));
	});

var _gampleman$elm_visualization$Visualization_Shape$slope2 = F3(
	function (_p1, _p0, t) {
		var _p2 = _p1;
		var _p3 = _p0;
		var h = _p3._0 - _p2._0;
		return _elm_lang$core$Native_Utils.eq(h, 0) ? t : (((3 * (_p3._1 - _p2._1)) / h) - (t / 2));
	});
var _gampleman$elm_visualization$Visualization_Shape$sign = function (x) {
	return (_elm_lang$core$Native_Utils.cmp(x, 0) < 0) ? -1 : 1;
};
var _gampleman$elm_visualization$Visualization_Shape$slope3 = F3(
	function (_p6, _p5, _p4) {
		var _p7 = _p6;
		var _p8 = _p5;
		var _p11 = _p8._1;
		var _p10 = _p8._0;
		var _p9 = _p4;
		var h1 = _p9._0 - _p10;
		var h0 = _p10 - _p7._0;
		var h = _elm_lang$core$Native_Utils.eq(h1, 0) ? ((_elm_lang$core$Native_Utils.cmp(h0, 0) < 0) ? 0 : h0) : h1;
		var s0 = (_p11 - _p7._1) / h;
		var s1 = (_p9._1 - _p11) / h;
		var p = ((s0 * h1) + (s1 * h0)) / (h0 + h1);
		return (_gampleman$elm_visualization$Visualization_Shape$sign(s0) + _gampleman$elm_visualization$Visualization_Shape$sign(s1)) * A2(
			_elm_lang$core$Basics$min,
			A2(
				_elm_lang$core$Basics$min,
				_elm_lang$core$Basics$abs(s0),
				_elm_lang$core$Basics$abs(s1)),
			0.5 * _elm_lang$core$Basics$abs(p));
	});
var _gampleman$elm_visualization$Visualization_Shape$pie = F2(
	function (settings, data) {
		var unsafeGet = F2(
			function (index, array) {
				var _p12 = A2(_elm_lang$core$Array$get, index, array);
				if (_p12.ctor === 'Just') {
					return _p12._0;
				} else {
					return _elm_lang$core$Native_Utils.crashCase(
						'Visualization.Shape',
						{
							start: {line: 642, column: 13},
							end: {line: 647, column: 59}
						},
						_p12)('This should never happen');
				}
			});
		var dataArray = _elm_lang$core$Array$fromList(data);
		var sortedIndices = function (_p14) {
			return A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(
					_elm_lang$core$List$sortWith,
					F2(
						function (_p16, _p15) {
							var _p17 = _p16;
							var _p18 = _p15;
							return A2(settings.sortingFn, _p17._1, _p18._1);
						}),
					A2(
						_elm_lang$core$List$indexedMap,
						F2(
							function (v0, v1) {
								return {ctor: '_Tuple2', _0: v0, _1: v1};
							}),
						_p14)));
		};
		var da = A2(
			_elm_lang$core$Basics$min,
			2 * _elm_lang$core$Basics$pi,
			A2(_elm_lang$core$Basics$max, -2 * _elm_lang$core$Basics$pi, settings.endAngle - settings.startAngle));
		var p = A2(
			_elm_lang$core$Basics$min,
			_elm_lang$core$Basics$abs(da) / _elm_lang$core$Basics$toFloat(
				_elm_lang$core$List$length(data)),
			settings.padAngle);
		var pa = p * ((_elm_lang$core$Native_Utils.cmp(da, 0) < 0) ? -1 : 1);
		var summer = F2(
			function (a, b) {
				var v = settings.valueFn(a);
				return (_elm_lang$core$Native_Utils.cmp(v, 0) > 0) ? (v + b) : b;
			});
		var sum = A3(_elm_lang$core$List$foldr, summer, 0, data);
		var k = _elm_lang$core$Native_Utils.eq(sum, 0) ? 0 : ((da - (_elm_lang$core$Basics$toFloat(
			_elm_lang$core$List$length(data)) * pa)) / sum);
		var computeValue = F2(
			function (el, angle) {
				var value = settings.valueFn(el);
				return {
					innerRadius: settings.innerRadius,
					outerRadius: settings.outerRadius,
					cornerRadius: settings.cornerRadius,
					startAngle: angle,
					endAngle: (angle + ((_elm_lang$core$Native_Utils.cmp(value, 0) > 0) ? (value * k) : 0)) + pa,
					padAngle: p,
					padRadius: settings.padRadius
				};
			});
		var helper = F2(
			function (index, _p19) {
				var _p20 = _p19;
				var r = A2(
					computeValue,
					A2(unsafeGet, index, dataArray),
					_p20._0);
				return {
					ctor: '_Tuple2',
					_0: r.endAngle,
					_1: A3(_elm_lang$core$Dict$insert, index, r, _p20._1)
				};
			});
		return _elm_lang$core$Dict$values(
			_elm_lang$core$Tuple$second(
				A3(
					_elm_lang$core$List$foldl,
					helper,
					{ctor: '_Tuple2', _0: settings.startAngle, _1: _elm_lang$core$Dict$empty},
					sortedIndices(data))));
	});
var _gampleman$elm_visualization$Visualization_Shape$defaultPieConfig = {startAngle: 0, endAngle: 2 * _elm_lang$core$Basics$pi, padAngle: 0, sortingFn: _elm_lang$core$Basics$compare, valueFn: _elm_lang$core$Basics$identity, innerRadius: 0, outerRadius: 100, cornerRadius: 0, padRadius: 0};
var _gampleman$elm_visualization$Visualization_Shape$centroid = function (arcData) {
	var a = ((arcData.startAngle + arcData.endAngle) / 2) - (_elm_lang$core$Basics$pi / 2);
	var r = (arcData.innerRadius + arcData.outerRadius) / 2;
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Basics$cos(a) * r,
		_1: _elm_lang$core$Basics$sin(a) * r
	};
};
var _gampleman$elm_visualization$Visualization_Shape$myAsin = function (x) {
	return (_elm_lang$core$Native_Utils.cmp(x, 1) > -1) ? (_elm_lang$core$Basics$pi / 2) : ((_elm_lang$core$Native_Utils.cmp(x, -1) < 1) ? ((0 - _elm_lang$core$Basics$pi) / 2) : _elm_lang$core$Basics$asin(x));
};
var _gampleman$elm_visualization$Visualization_Shape$cornerTangents = F7(
	function (x0, y0, x1, y1, r1, rc, cw) {
		var r = r1 - rc;
		var y01 = y0 - y1;
		var x01 = x0 - x1;
		var lo = (cw ? rc : (0 - rc)) / _elm_lang$core$Basics$sqrt(
			Math.pow(x01, 2) + Math.pow(y01, 2));
		var ox = lo * y01;
		var x11 = x0 + ox;
		var x10 = x1 + ox;
		var x00 = (x11 + x10) / 2;
		var dx = x10 - x11;
		var oy = (0 - lo) * x01;
		var y11 = y0 + oy;
		var y10 = y1 + oy;
		var y00 = (y11 + y10) / 2;
		var dy = y10 - y11;
		var d2 = Math.pow(dx, 2) + Math.pow(dy, 2);
		var dd = (x11 * y10) - (x10 * y11);
		var d = ((_elm_lang$core$Native_Utils.cmp(dy, 0) < 0) ? -1 : 1) * _elm_lang$core$Basics$sqrt(
			A2(
				_elm_lang$core$Basics$max,
				0,
				(Math.pow(r, 2) * d2) - Math.pow(dd, 2)));
		var cx0 = ((dd * dy) - (dx * d)) / d2;
		var dx0 = cx0 - x00;
		var cy0 = (((0 - dd) * dx) - (dy * d)) / d2;
		var dy0 = cy0 - y00;
		var cx1 = ((dd * dy) + (dx * d)) / d2;
		var dx1 = cx1 - x00;
		var cy1 = (((0 - dd) * dx) + (dy * d)) / d2;
		var dy1 = cy1 - y00;
		var _p21 = (_elm_lang$core$Native_Utils.cmp(
			Math.pow(dx0, 2) + Math.pow(dy0, 2),
			Math.pow(dx1, 2) + Math.pow(dy1, 2)) > 0) ? {ctor: '_Tuple2', _0: cx1, _1: cy1} : {ctor: '_Tuple2', _0: cx0, _1: cy0};
		var fcx = _p21._0;
		var fxy = _p21._1;
		return {cx: fcx, cy: fxy, x01: 0 - ox, y01: 0 - oy, x11: fcx * ((r1 / r) - 1), y11: fxy * ((r1 / r) - 1)};
	});
var _gampleman$elm_visualization$Visualization_Shape$intersect = F8(
	function (x0, y0, x1, y1, x2, y2, x3, y3) {
		var y32 = y3 - y2;
		var x32 = x3 - x2;
		var y10 = y1 - y0;
		var x10 = x1 - x0;
		var t = ((x32 * (y0 - y2)) - (y32 * (x0 - x2))) / ((y32 * x10) - (x32 * y10));
		return {ctor: '_Tuple2', _0: x0 + (t * x10), _1: y0 + (t * y10)};
	});
var _gampleman$elm_visualization$Visualization_Shape$epsilon = 1.0e-12;
var _gampleman$elm_visualization$Visualization_Shape$arc = function (arcData) {
	var a1 = arcData.endAngle - (_elm_lang$core$Basics$pi / 2);
	var a0 = arcData.startAngle - (_elm_lang$core$Basics$pi / 2);
	var da = _elm_lang$core$Basics$abs(a1 - a0);
	var cw = _elm_lang$core$Native_Utils.cmp(a1, a0) > 0;
	var _p22 = (_elm_lang$core$Native_Utils.cmp(arcData.innerRadius, arcData.outerRadius) > 0) ? {ctor: '_Tuple2', _0: arcData.outerRadius, _1: arcData.innerRadius} : {ctor: '_Tuple2', _0: arcData.innerRadius, _1: arcData.outerRadius};
	var r0 = _p22._0;
	var r1 = _p22._1;
	var path = function () {
		if (_elm_lang$core$Native_Utils.cmp(r1, _gampleman$elm_visualization$Visualization_Shape$epsilon) < 1) {
			return A3(_gampleman$elm_visualization$Visualization_Path$moveTo, 0, 0, _gampleman$elm_visualization$Visualization_Path$begin);
		} else {
			if (_elm_lang$core$Native_Utils.cmp(da, (2 * _elm_lang$core$Basics$pi) - _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) {
				var p = A7(
					_gampleman$elm_visualization$Visualization_Path$arc,
					0,
					0,
					r1,
					a0,
					a1,
					!cw,
					A3(
						_gampleman$elm_visualization$Visualization_Path$moveTo,
						r1 * _elm_lang$core$Basics$cos(a0),
						r1 * _elm_lang$core$Basics$sin(a0),
						_gampleman$elm_visualization$Visualization_Path$begin));
				return (_elm_lang$core$Native_Utils.cmp(r0, _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) ? A7(
					_gampleman$elm_visualization$Visualization_Path$arc,
					0,
					0,
					r0,
					a1,
					a0,
					cw,
					A3(
						_gampleman$elm_visualization$Visualization_Path$moveTo,
						r0 * _elm_lang$core$Basics$cos(a1),
						r0 * _elm_lang$core$Basics$sin(a1),
						p)) : p;
			} else {
				var rc = A2(
					_elm_lang$core$Basics$min,
					_elm_lang$core$Basics$abs(r1 - r0) / 2,
					arcData.cornerRadius);
				var ap = arcData.padAngle / 2;
				var rp = (_elm_lang$core$Native_Utils.cmp(ap, _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) ? ((_elm_lang$core$Native_Utils.cmp(arcData.padRadius, 0) > 0) ? arcData.padRadius : _elm_lang$core$Basics$sqrt(
					Math.pow(r0, 2) + Math.pow(r1, 2))) : 0;
				var p0 = _gampleman$elm_visualization$Visualization_Shape$myAsin(
					(rp / r0) * _elm_lang$core$Basics$sin(ap));
				var _p23 = (_elm_lang$core$Native_Utils.cmp(rp, _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) ? ((_elm_lang$core$Native_Utils.cmp(da - (p0 * 2), _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) ? (cw ? {ctor: '_Tuple3', _0: a0 + p0, _1: a1 - p0, _2: da - (p0 * 2)} : {ctor: '_Tuple3', _0: a0 - p0, _1: a1 + p0, _2: da - (p0 * 2)}) : {ctor: '_Tuple3', _0: (a0 + a1) / 2, _1: (a0 + a1) / 2, _2: 0}) : {ctor: '_Tuple3', _0: a0, _1: a1, _2: da};
				var a00 = _p23._0;
				var a10 = _p23._1;
				var da0 = _p23._2;
				var x10 = r0 * _elm_lang$core$Basics$cos(a10);
				var y10 = r0 * _elm_lang$core$Basics$sin(a10);
				var x00 = r0 * _elm_lang$core$Basics$cos(a00);
				var y00 = r0 * _elm_lang$core$Basics$sin(a00);
				var p1 = _gampleman$elm_visualization$Visualization_Shape$myAsin(
					(rp / r1) * _elm_lang$core$Basics$sin(ap));
				var _p24 = (_elm_lang$core$Native_Utils.cmp(rp, _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) ? ((_elm_lang$core$Native_Utils.cmp(da - (p1 * 2), _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) ? (cw ? {ctor: '_Tuple3', _0: a0 + p1, _1: a1 - p1, _2: da - (p1 * 2)} : {ctor: '_Tuple3', _0: a0 - p1, _1: a1 + p1, _2: da - (p1 * 2)}) : {ctor: '_Tuple3', _0: (a0 + a1) / 2, _1: (a0 + a1) / 2, _2: 0}) : {ctor: '_Tuple3', _0: a0, _1: a1, _2: da};
				var a01 = _p24._0;
				var a11 = _p24._1;
				var da1 = _p24._2;
				var x01 = r1 * _elm_lang$core$Basics$cos(a01);
				var y01 = r1 * _elm_lang$core$Basics$sin(a01);
				var x11 = r1 * _elm_lang$core$Basics$cos(a11);
				var y11 = r1 * _elm_lang$core$Basics$sin(a11);
				var _p25 = (_elm_lang$core$Native_Utils.cmp(da0, _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) ? A8(_gampleman$elm_visualization$Visualization_Shape$intersect, x01, y01, x00, y00, x11, y11, x10, y10) : {ctor: '_Tuple2', _0: x10, _1: y10};
				var ocx = _p25._0;
				var ocy = _p25._1;
				var lc = _elm_lang$core$Basics$sqrt(
					Math.pow(ocx, 2) + Math.pow(ocy, 2));
				var _p26 = {ctor: '_Tuple4', _0: x01 - ocx, _1: y01 - ocy, _2: x11 - ocx, _3: y11 - ocy};
				var ax = _p26._0;
				var ay = _p26._1;
				var bx = _p26._2;
				var by = _p26._3;
				var kc = 1 / _elm_lang$core$Basics$sin(
					_elm_lang$core$Basics$acos(
						((ax * bx) + (ay * by)) / (_elm_lang$core$Basics$sqrt(
							Math.pow(ax, 2) + Math.pow(ay, 2)) * _elm_lang$core$Basics$sqrt(
							Math.pow(bx, 2) + Math.pow(by, 2)))) / 2);
				var _p27 = ((_elm_lang$core$Native_Utils.cmp(rc, _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) && (_elm_lang$core$Native_Utils.cmp(da, _elm_lang$core$Basics$pi) < 0)) ? {
					ctor: '_Tuple2',
					_0: A2(_elm_lang$core$Basics$min, rc, (r0 - lc) / (kc - 1)),
					_1: A2(_elm_lang$core$Basics$min, rc, (r1 - lc) / (kc + 1))
				} : {ctor: '_Tuple2', _0: rc, _1: rc};
				var rc0 = _p27._0;
				var rc1 = _p27._1;
				var outerRing = function () {
					if (_elm_lang$core$Native_Utils.cmp(da1, _gampleman$elm_visualization$Visualization_Shape$epsilon) < 1) {
						return A3(_gampleman$elm_visualization$Visualization_Path$moveTo, x01, y01, _gampleman$elm_visualization$Visualization_Path$begin);
					} else {
						if (_elm_lang$core$Native_Utils.cmp(rc1, _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) {
							var t1 = A7(_gampleman$elm_visualization$Visualization_Shape$cornerTangents, x11, y11, x10, y10, r1, rc1, cw);
							var t0 = A7(_gampleman$elm_visualization$Visualization_Shape$cornerTangents, x00, y00, x01, y01, r1, rc1, cw);
							var p = A3(_gampleman$elm_visualization$Visualization_Path$moveTo, t0.cx + t0.x01, t0.cy + t0.y01, _gampleman$elm_visualization$Visualization_Path$begin);
							return (_elm_lang$core$Native_Utils.cmp(rc1, rc) < 0) ? A7(
								_gampleman$elm_visualization$Visualization_Path$arc,
								t0.cx,
								t0.cy,
								rc1,
								A2(_elm_lang$core$Basics$atan2, t0.y01, t0.x01),
								A2(_elm_lang$core$Basics$atan2, t1.y01, t1.x01),
								!cw,
								p) : A7(
								_gampleman$elm_visualization$Visualization_Path$arc,
								t1.cx,
								t1.cy,
								rc1,
								A2(_elm_lang$core$Basics$atan2, t1.y11, t1.x11),
								A2(_elm_lang$core$Basics$atan2, t1.y01, t1.x01),
								!cw,
								A7(
									_gampleman$elm_visualization$Visualization_Path$arc,
									0,
									0,
									r1,
									A2(_elm_lang$core$Basics$atan2, t0.cy + t0.y11, t0.cx + t0.x11),
									A2(_elm_lang$core$Basics$atan2, t1.cy + t1.y11, t1.cx + t1.x11),
									!cw,
									A7(
										_gampleman$elm_visualization$Visualization_Path$arc,
										t0.cx,
										t0.cy,
										rc1,
										A2(_elm_lang$core$Basics$atan2, t0.y01, t0.x01),
										A2(_elm_lang$core$Basics$atan2, t0.y11, t0.x11),
										!cw,
										p)));
						} else {
							return A7(
								_gampleman$elm_visualization$Visualization_Path$arc,
								0,
								0,
								r1,
								a01,
								a11,
								!cw,
								A3(_gampleman$elm_visualization$Visualization_Path$moveTo, x01, y01, _gampleman$elm_visualization$Visualization_Path$begin));
						}
					}
				}();
				if ((_elm_lang$core$Native_Utils.cmp(r0, _gampleman$elm_visualization$Visualization_Shape$epsilon) < 1) || (_elm_lang$core$Native_Utils.cmp(da0, _gampleman$elm_visualization$Visualization_Shape$epsilon) < 1)) {
					return A3(_gampleman$elm_visualization$Visualization_Path$lineTo, x10, y10, outerRing);
				} else {
					if (_elm_lang$core$Native_Utils.cmp(rc0, _gampleman$elm_visualization$Visualization_Shape$epsilon) > 0) {
						var t1 = A7(_gampleman$elm_visualization$Visualization_Shape$cornerTangents, x01, y01, x00, y00, r0, 0 - rc0, cw);
						var t0 = A7(_gampleman$elm_visualization$Visualization_Shape$cornerTangents, x10, y10, x11, y11, r0, 0 - rc0, cw);
						var p = A3(_gampleman$elm_visualization$Visualization_Path$lineTo, t0.cx + t0.x01, t0.cy + t0.y01, outerRing);
						return (_elm_lang$core$Native_Utils.cmp(rc0, rc) < 0) ? A7(
							_gampleman$elm_visualization$Visualization_Path$arc,
							t0.cx,
							t0.cy,
							rc0,
							A2(_elm_lang$core$Basics$atan2, t0.y01, t0.x01),
							A2(_elm_lang$core$Basics$atan2, t1.y01, t1.x01),
							!cw,
							p) : A7(
							_gampleman$elm_visualization$Visualization_Path$arc,
							t1.cx,
							t1.cy,
							rc0,
							A2(_elm_lang$core$Basics$atan2, t1.y11, t1.x11),
							A2(_elm_lang$core$Basics$atan2, t1.y01, t1.x01),
							!cw,
							A7(
								_gampleman$elm_visualization$Visualization_Path$arc,
								0,
								0,
								r0,
								A2(_elm_lang$core$Basics$atan2, t0.cy + t0.y11, t0.cx + t0.x11),
								A2(_elm_lang$core$Basics$atan2, t1.cy + t1.y11, t1.cx + t1.x11),
								cw,
								A7(
									_gampleman$elm_visualization$Visualization_Path$arc,
									t0.cx,
									t0.cy,
									rc0,
									A2(_elm_lang$core$Basics$atan2, t0.y01, t0.x01),
									A2(_elm_lang$core$Basics$atan2, t0.y11, t0.x11),
									!cw,
									p)));
					} else {
						return A7(_gampleman$elm_visualization$Visualization_Path$arc, 0, 0, r0, a10, a00, cw, outerRing);
					}
				}
			}
		}
	}();
	return _gampleman$elm_visualization$Visualization_Path$toAttrString(
		_gampleman$elm_visualization$Visualization_Path$close(path));
};
var _gampleman$elm_visualization$Visualization_Shape$Arc = F7(
	function (a, b, c, d, e, f, g) {
		return {innerRadius: a, outerRadius: b, cornerRadius: c, startAngle: d, endAngle: e, padAngle: f, padRadius: g};
	});
var _gampleman$elm_visualization$Visualization_Shape$PieConfig = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {startAngle: a, endAngle: b, padAngle: c, sortingFn: d, valueFn: e, innerRadius: f, outerRadius: g, cornerRadius: h, padRadius: i};
	});
var _gampleman$elm_visualization$Visualization_Shape$Area = function (a) {
	return {ctor: 'Area', _0: a};
};
var _gampleman$elm_visualization$Visualization_Shape$area = F2(
	function (curve, data) {
		var makeCurves = F2(
			function (datum, _p28) {
				var _p29 = _p28;
				var _p30 = {ctor: '_Tuple3', _0: _p29._0, _1: datum, _2: _p29._1};
				if (_p30._1.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _p30._2};
				} else {
					if (_p30._0.ctor === 'Nothing') {
						var _p31 = _p30._1._0;
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Maybe$Just(_p31),
							_1: {
								ctor: '::',
								_0: _gampleman$elm_visualization$Visualization_Shape$Area(
									{
										ctor: '::',
										_0: _p31,
										_1: {ctor: '[]'}
									}),
								_1: _p30._2
							}
						};
					} else {
						if ((_p30._2.ctor === '::') && (_p30._2._0.ctor === 'Area')) {
							var _p32 = _p30._1._0;
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(_p32),
								_1: {
									ctor: '::',
									_0: _gampleman$elm_visualization$Visualization_Shape$Area(
										{ctor: '::', _0: _p32, _1: _p30._2._0._0}),
									_1: _p30._2._1
								}
							};
						} else {
							var _p33 = _p30._1._0;
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(_p33),
								_1: {
									ctor: '::',
									_0: _gampleman$elm_visualization$Visualization_Shape$Area(
										{
											ctor: '::',
											_0: _p33,
											_1: {ctor: '[]'}
										}),
									_1: _p30._2
								}
							};
						}
					}
				}
			});
		return _gampleman$elm_visualization$Visualization_Path$toAttrString(
			A2(
				_elm_lang$core$List$concatMap,
				curve,
				_elm_lang$core$Tuple$second(
					A3(
						_elm_lang$core$List$foldr,
						makeCurves,
						{
							ctor: '_Tuple2',
							_0: _elm_lang$core$Maybe$Nothing,
							_1: {ctor: '[]'}
						},
						data))));
	});
var _gampleman$elm_visualization$Visualization_Shape$Line = function (a) {
	return {ctor: 'Line', _0: a};
};
var _gampleman$elm_visualization$Visualization_Shape$applyRecursivelyForArea = F2(
	function (fn, points) {
		var points1 = _elm_lang$core$List$reverse(
			A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$second, points));
		var points0 = A2(_elm_lang$core$List$map, _elm_lang$core$Tuple$first, points);
		var _p34 = {
			ctor: '_Tuple2',
			_0: fn(
				_gampleman$elm_visualization$Visualization_Shape$Line(points1)),
			_1: points1
		};
		if ((((_p34.ctor === '_Tuple2') && (_p34._0.ctor === '::')) && (_p34._1.ctor === '::')) && (_p34._1._0.ctor === '_Tuple2')) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				A3(
					_gampleman$elm_visualization$Visualization_Path$lineTo,
					_p34._1._0._0,
					_p34._1._0._1,
					fn(
						_gampleman$elm_visualization$Visualization_Shape$Line(points0))),
				_gampleman$elm_visualization$Visualization_Path$close(_p34._0._1));
		} else {
			return {ctor: '[]'};
		}
	});
var _gampleman$elm_visualization$Visualization_Shape$linearCurve = function (part) {
	var _p35 = part;
	if (_p35.ctor === 'Line') {
		if (_p35._0.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			return {
				ctor: '::',
				_0: _gampleman$elm_visualization$Visualization_Path$Move(_p35._0._0),
				_1: A2(_elm_lang$core$List$map, _gampleman$elm_visualization$Visualization_Path$Line, _p35._0._1)
			};
		}
	} else {
		return A2(_gampleman$elm_visualization$Visualization_Shape$applyRecursivelyForArea, _gampleman$elm_visualization$Visualization_Shape$linearCurve, _p35._0);
	}
};
var _gampleman$elm_visualization$Visualization_Shape$monotoneInXCurve = function (part) {
	var point = F5(
		function (_p37, _p36, t0, t1, path) {
			var _p38 = _p37;
			var _p42 = _p38._0;
			var _p39 = _p36;
			var _p41 = _p39._1;
			var _p40 = _p39._0;
			var dx = (_p40 - _p42) / 3;
			return A7(_gampleman$elm_visualization$Visualization_Path$bezierCurveTo, _p42 + dx, _p38._1 + (dx * t0), _p40 - dx, _p41 - (dx * t1), _p40, _p41, path);
		});
	var finalize = function (_p43) {
		var _p44 = _p43;
		var _p51 = _p44._1._1;
		var _p50 = _p44._0._1;
		var _p49 = _p44._1._0;
		var _p48 = _p44._0._0;
		var _p47 = _p44._3;
		var _p45 = _p44._2;
		if (_p45.ctor === 'Nothing') {
			return A3(_gampleman$elm_visualization$Visualization_Path$lineTo, _p49, _p51, _p47);
		} else {
			var _p46 = _p45._0;
			return A5(
				point,
				{ctor: '_Tuple2', _0: _p48, _1: _p50},
				{ctor: '_Tuple2', _0: _p49, _1: _p51},
				_p46,
				A3(
					_gampleman$elm_visualization$Visualization_Shape$slope2,
					{ctor: '_Tuple2', _0: _p48, _1: _p50},
					{ctor: '_Tuple2', _0: _p49, _1: _p51},
					_p46),
				_p47);
		}
	};
	var helper = F2(
		function (_p53, _p52) {
			var _p54 = _p53;
			var _p62 = _p54._1;
			var _p61 = _p54._0;
			var _p55 = _p52;
			var _p60 = _p55._1._1;
			var _p59 = _p55._0._1;
			var _p58 = _p55._1._0;
			var _p57 = _p55._0._0;
			var t1 = A3(
				_gampleman$elm_visualization$Visualization_Shape$slope3,
				{ctor: '_Tuple2', _0: _p57, _1: _p59},
				{ctor: '_Tuple2', _0: _p58, _1: _p60},
				{ctor: '_Tuple2', _0: _p61, _1: _p62});
			var t0 = function () {
				var _p56 = _p55._2;
				if (_p56.ctor === 'Nothing') {
					return A3(
						_gampleman$elm_visualization$Visualization_Shape$slope2,
						{ctor: '_Tuple2', _0: _p57, _1: _p59},
						{ctor: '_Tuple2', _0: _p58, _1: _p60},
						t1);
				} else {
					return _p56._0;
				}
			}();
			return {
				ctor: '_Tuple4',
				_0: {ctor: '_Tuple2', _0: _p58, _1: _p60},
				_1: {ctor: '_Tuple2', _0: _p61, _1: _p62},
				_2: _elm_lang$core$Maybe$Just(t1),
				_3: A5(
					point,
					{ctor: '_Tuple2', _0: _p57, _1: _p59},
					{ctor: '_Tuple2', _0: _p58, _1: _p60},
					t0,
					t1,
					_p55._3)
			};
		});
	var _p63 = part;
	if (_p63.ctor === 'Line') {
		if (_p63._0.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			if (_p63._0._1.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				var _p64 = _p63._0._0;
				return finalize(
					A3(
						_elm_lang$core$List$foldl,
						helper,
						{
							ctor: '_Tuple4',
							_0: _p64,
							_1: _p63._0._1._0,
							_2: _elm_lang$core$Maybe$Nothing,
							_3: {
								ctor: '::',
								_0: _gampleman$elm_visualization$Visualization_Path$Move(_p64),
								_1: {ctor: '[]'}
							}
						},
						_p63._0._1._1));
			}
		}
	} else {
		return A2(_gampleman$elm_visualization$Visualization_Shape$applyRecursivelyForArea, _gampleman$elm_visualization$Visualization_Shape$monotoneInXCurve, _p63._0);
	}
};
var _gampleman$elm_visualization$Visualization_Shape$line = F2(
	function (curve, data) {
		var makeCurves = F2(
			function (datum, _p65) {
				var _p66 = _p65;
				var _p67 = {ctor: '_Tuple3', _0: _p66._0, _1: datum, _2: _p66._1};
				if (_p67._1.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _p67._2};
				} else {
					if (_p67._0.ctor === 'Nothing') {
						var _p68 = _p67._1._0;
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Maybe$Just(_p68),
							_1: {
								ctor: '::',
								_0: _gampleman$elm_visualization$Visualization_Shape$Line(
									{
										ctor: '::',
										_0: _p68,
										_1: {ctor: '[]'}
									}),
								_1: _p67._2
							}
						};
					} else {
						if ((_p67._2.ctor === '::') && (_p67._2._0.ctor === 'Line')) {
							var _p69 = _p67._1._0;
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(_p69),
								_1: {
									ctor: '::',
									_0: _gampleman$elm_visualization$Visualization_Shape$Line(
										{ctor: '::', _0: _p69, _1: _p67._2._0._0}),
									_1: _p67._2._1
								}
							};
						} else {
							var _p70 = _p67._1._0;
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(_p70),
								_1: {
									ctor: '::',
									_0: _gampleman$elm_visualization$Visualization_Shape$Line(
										{
											ctor: '::',
											_0: _p70,
											_1: {ctor: '[]'}
										}),
									_1: _p67._2
								}
							};
						}
					}
				}
			});
		return _gampleman$elm_visualization$Visualization_Path$toAttrString(
			A2(
				_elm_lang$core$List$concatMap,
				curve,
				_elm_lang$core$Tuple$second(
					A3(
						_elm_lang$core$List$foldr,
						makeCurves,
						{
							ctor: '_Tuple2',
							_0: _elm_lang$core$Maybe$Nothing,
							_1: {ctor: '[]'}
						},
						data))));
	});

var _user$project$Joystick$steeringRect = function (angle) {
	return A2(
		_elm_lang$svg$Svg$rect,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$fill('#000000'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$x('48'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$y('0'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$width('4'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$height('100'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$transform(
									A2(
										_elm_lang$core$Basics_ops['++'],
										'rotate(',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(
												_elm_lang$core$Basics$round(angle * 90)),
											', 50, 50)'))),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		},
		{ctor: '[]'});
};
var _user$project$Joystick$thrustRect = function (thrust) {
	return A2(
		_elm_lang$svg$Svg$rect,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$fill('#B0B0FF'),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$x('0'),
				_1: {
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$y(
						_elm_lang$core$Basics$toString(
							_elm_lang$core$Basics$round(100 - (thrust * 100)))),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$width('100'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$height(
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Basics$round(thrust * 100))),
							_1: {ctor: '[]'}
						}
					}
				}
			}
		},
		{ctor: '[]'});
};
var _user$project$Joystick$joystickDisplay = function (data) {
	var middle = function (x) {
		return _elm_lang$core$Basics$toString(
			_elm_lang$core$Basics$floor(50 + (50 * x)));
	};
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'width', _1: '400px'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'height', _1: '400px'},
						_1: {ctor: '[]'}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$svg,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$version('1.1'),
					_1: {
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$x('0'),
						_1: {
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$y('0'),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$viewBox('0 0 100 100'),
								_1: {ctor: '[]'}
							}
						}
					}
				},
				{
					ctor: '::',
					_0: _user$project$Joystick$thrustRect(data.thrust),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$svg$Svg$circle,
							{
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$fill('#F0F9F0'),
								_1: {
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$cx('50'),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$cy('50'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$r('50'),
											_1: {ctor: '[]'}
										}
									}
								}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: _user$project$Joystick$steeringRect(data.rotation),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$circle,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$fill('#FFB0B0'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$cx(
												middle(data.x)),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$cy(
													middle(data.y)),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$r('5'),
													_1: {ctor: '[]'}
												}
											}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Joystick$connected = _elm_lang$core$Native_Platform.incomingPort('connected', _elm_lang$core$Json_Decode$int);
var _user$project$Joystick$disconnected = _elm_lang$core$Native_Platform.incomingPort('disconnected', _elm_lang$core$Json_Decode$int);
var _user$project$Joystick$poll = _elm_lang$core$Native_Platform.outgoingPort(
	'poll',
	function (v) {
		return v;
	});
var _user$project$Joystick$axisData = _elm_lang$core$Native_Platform.incomingPort(
	'axisData',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (x) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (y) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (rotation) {
							return A2(
								_elm_lang$core$Json_Decode$andThen,
								function (thrust) {
									return _elm_lang$core$Json_Decode$succeed(
										{x: x, y: y, rotation: rotation, thrust: thrust});
								},
								A2(_elm_lang$core$Json_Decode$field, 'thrust', _elm_lang$core$Json_Decode$float));
						},
						A2(_elm_lang$core$Json_Decode$field, 'rotation', _elm_lang$core$Json_Decode$float));
				},
				A2(_elm_lang$core$Json_Decode$field, 'y', _elm_lang$core$Json_Decode$float));
		},
		A2(_elm_lang$core$Json_Decode$field, 'x', _elm_lang$core$Json_Decode$float)));
var _user$project$Joystick$JoystickData = F4(
	function (a, b, c, d) {
		return {x: a, y: b, rotation: c, thrust: d};
	});

var _user$project$Sensors$padding = 30;
var _user$project$Sensors$h = 225;
var _user$project$Sensors$w = 450;
var _user$project$Sensors$viewSensor = function (model) {
	var opts = _gampleman$elm_visualization$Visualization_Axis$defaultOptions;
	var yScale = A2(
		_gampleman$elm_visualization$Visualization_Scale$linear,
		{ctor: '_Tuple2', _0: 0, _1: 5},
		{ctor: '_Tuple2', _0: _user$project$Sensors$h - (2 * _user$project$Sensors$padding), _1: 0});
	var yAxis = A2(
		_gampleman$elm_visualization$Visualization_Axis$axis,
		_elm_lang$core$Native_Utils.update(
			opts,
			{orientation: _gampleman$elm_visualization$Visualization_Axis$Left, tickCount: 5}),
		yScale);
	var xScale = A2(
		_gampleman$elm_visualization$Visualization_Scale$time,
		{
			ctor: '_Tuple2',
			_0: _elm_lang$core$Date$fromTime(1448928000000),
			_1: _elm_lang$core$Date$fromTime(1456790400000)
		},
		{ctor: '_Tuple2', _0: 0, _1: _user$project$Sensors$w - (2 * _user$project$Sensors$padding)});
	var xAxis = A2(
		_gampleman$elm_visualization$Visualization_Axis$axis,
		_elm_lang$core$Native_Utils.update(
			opts,
			{
				orientation: _gampleman$elm_visualization$Visualization_Axis$Bottom,
				tickCount: _elm_lang$core$List$length(model)
			}),
		xScale);
	var areaGenerator = function (_p0) {
		var _p1 = _p0;
		var _p2 = _p1._0;
		return _elm_lang$core$Maybe$Just(
			{
				ctor: '_Tuple2',
				_0: {
					ctor: '_Tuple2',
					_0: A2(_gampleman$elm_visualization$Visualization_Scale$convert, xScale, _p2),
					_1: _elm_lang$core$Tuple$first(
						_gampleman$elm_visualization$Visualization_Scale$rangeExtent(yScale))
				},
				_1: {
					ctor: '_Tuple2',
					_0: A2(_gampleman$elm_visualization$Visualization_Scale$convert, xScale, _p2),
					_1: A2(_gampleman$elm_visualization$Visualization_Scale$convert, yScale, _p1._1)
				}
			});
	};
	var area = A2(
		_gampleman$elm_visualization$Visualization_Shape$area,
		_gampleman$elm_visualization$Visualization_Shape$monotoneInXCurve,
		A2(_elm_lang$core$List$map, areaGenerator, model));
	var lineGenerator = function (_p3) {
		var _p4 = _p3;
		return _elm_lang$core$Maybe$Just(
			{
				ctor: '_Tuple2',
				_0: A2(_gampleman$elm_visualization$Visualization_Scale$convert, xScale, _p4._0),
				_1: A2(_gampleman$elm_visualization$Visualization_Scale$convert, yScale, _p4._1)
			});
	};
	var line = A2(
		_gampleman$elm_visualization$Visualization_Shape$line,
		_gampleman$elm_visualization$Visualization_Shape$monotoneInXCurve,
		A2(_elm_lang$core$List$map, lineGenerator, model));
	return A2(
		_elm_lang$svg$Svg$svg,
		{
			ctor: '::',
			_0: _elm_lang$svg$Svg_Attributes$width(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_user$project$Sensors$w),
					'px')),
			_1: {
				ctor: '::',
				_0: _elm_lang$svg$Svg_Attributes$height(
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(_user$project$Sensors$h),
						'px')),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$svg$Svg$g,
				{
					ctor: '::',
					_0: _elm_lang$svg$Svg_Attributes$transform(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'translate(',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(_user$project$Sensors$padding - 1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									', ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(_user$project$Sensors$h - _user$project$Sensors$padding),
										')'))))),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: xAxis,
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$svg$Svg$g,
					{
						ctor: '::',
						_0: _elm_lang$svg$Svg_Attributes$transform(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'translate(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(_user$project$Sensors$padding - 1),
									A2(
										_elm_lang$core$Basics_ops['++'],
										', ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_elm_lang$core$Basics$toString(_user$project$Sensors$padding),
											')'))))),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: yAxis,
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$svg$Svg$g,
						{
							ctor: '::',
							_0: _elm_lang$svg$Svg_Attributes$transform(
								A2(
									_elm_lang$core$Basics_ops['++'],
									'translate(',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(_user$project$Sensors$padding),
										A2(
											_elm_lang$core$Basics_ops['++'],
											', ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(_user$project$Sensors$padding),
												')'))))),
							_1: {
								ctor: '::',
								_0: _elm_lang$svg$Svg_Attributes$class('series'),
								_1: {ctor: '[]'}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_elm_lang$svg$Svg$path,
								{
									ctor: '::',
									_0: _elm_lang$svg$Svg_Attributes$d(area),
									_1: {
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$stroke('none'),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$strokeWidth('3px'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$fill('rgba(255, 0, 0, 0.54)'),
												_1: {ctor: '[]'}
											}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$svg$Svg$path,
									{
										ctor: '::',
										_0: _elm_lang$svg$Svg_Attributes$d(line),
										_1: {
											ctor: '::',
											_0: _elm_lang$svg$Svg_Attributes$stroke('red'),
											_1: {
												ctor: '::',
												_0: _elm_lang$svg$Svg_Attributes$strokeWidth('3px'),
												_1: {
													ctor: '::',
													_0: _elm_lang$svg$Svg_Attributes$fill('none'),
													_1: {ctor: '[]'}
												}
											}
										}
									},
									{ctor: '[]'}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			}
		});
};

var _user$project$App$showMessage = function (str) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_List$li,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_MichaelCombs28$elm_mdl$Material_List$content,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text(str),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$App$messageList = function (messages) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_List$ul,
		{ctor: '[]'},
		A2(_elm_lang$core$List$map, _user$project$App$showMessage, messages));
};
var _user$project$App$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {phxSocket: a, currentMessage: b, messages: c, joystick: d, joystickIndex: e, sensorData: f, mdl: g};
	});
var _user$project$App$ChatMessage = function (a) {
	return {body: a};
};
var _user$project$App$chatMessageDecoder = A2(
	_elm_lang$core$Json_Decode$map,
	_user$project$App$ChatMessage,
	A2(_elm_lang$core$Json_Decode$field, 'body', _elm_lang$core$Json_Decode$string));
var _user$project$App$Flags = function (a) {
	return {host: a};
};
var _user$project$App$Mdl = function (a) {
	return {ctor: 'Mdl', _0: a};
};
var _user$project$App$SendControlToServer = function (a) {
	return {ctor: 'SendControlToServer', _0: a};
};
var _user$project$App$UpdateControlDisplay = function (a) {
	return {ctor: 'UpdateControlDisplay', _0: a};
};
var _user$project$App$AxisData = function (a) {
	return {ctor: 'AxisData', _0: a};
};
var _user$project$App$GamepadDisconnected = function (a) {
	return {ctor: 'GamepadDisconnected', _0: a};
};
var _user$project$App$GamepadConnected = function (a) {
	return {ctor: 'GamepadConnected', _0: a};
};
var _user$project$App$ReceiveChatMessage = function (a) {
	return {ctor: 'ReceiveChatMessage', _0: a};
};
var _user$project$App$SendMessage = {ctor: 'SendMessage'};
var _user$project$App$SetNewMessage = function (a) {
	return {ctor: 'SetNewMessage', _0: a};
};
var _user$project$App$viewBody = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'padding', _1: '2rem'},
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _user$project$Joystick$joystickDisplay(model.joystick),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$html$Html_Lazy$lazy, _user$project$Sensors$viewSensor, model.sensorData),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$form,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Events$onSubmit(_user$project$App$SendMessage),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A4(
								_MichaelCombs28$elm_mdl$Material_Textfield$render,
								_user$project$App$Mdl,
								{
									ctor: '::',
									_0: 0,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Textfield$onInput(_user$project$App$SetNewMessage),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Textfield$value(model.currentMessage),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _user$project$App$messageList(model.messages),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _user$project$App$view = function (model) {
	return A4(
		_MichaelCombs28$elm_mdl$Material_Layout$render,
		_user$project$App$Mdl,
		model.mdl,
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Layout$fixedHeader,
			_1: {
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Layout$scrolling,
				_1: {ctor: '[]'}
			}
		},
		{
			header: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$h1,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$style(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'padding', _1: '2rem'},
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$img,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$src('/images/logo_small.png'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html$text('LiTHe Hex'),
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			drawer: {ctor: '[]'},
			tabs: {
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			main: {
				ctor: '::',
				_0: _user$project$App$viewBody(model),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$App$PhoenixMsg = function (a) {
	return {ctor: 'PhoenixMsg', _0: a};
};
var _user$project$App$init = function (_p0) {
	var _p1 = _p0;
	var _p2 = A2(
		_fbonetti$elm_phoenix_socket$Phoenix_Socket$join,
		_fbonetti$elm_phoenix_socket$Phoenix_Channel$init('client'),
		A4(
			_fbonetti$elm_phoenix_socket$Phoenix_Socket$on,
			'new_msg',
			'client',
			_user$project$App$ReceiveChatMessage,
			_fbonetti$elm_phoenix_socket$Phoenix_Socket$withDebug(
				_fbonetti$elm_phoenix_socket$Phoenix_Socket$init(
					A2(
						_elm_lang$core$Basics_ops['++'],
						'ws://',
						A2(_elm_lang$core$Basics_ops['++'], _p1.host, '/socket/websocket'))))));
	var phxSocket = _p2._0;
	var phxCmd = _p2._1;
	return A2(
		_elm_lang$core$Platform_Cmd_ops['!'],
		{
			phxSocket: phxSocket,
			currentMessage: '',
			messages: {ctor: '[]'},
			joystick: {x: 0, y: 0, rotation: 0, thrust: 0},
			joystickIndex: _elm_lang$core$Maybe$Nothing,
			sensorData: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Date$fromTime(1448928000000),
					_1: 1.7
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Date$fromTime(1451606400000),
						_1: 2
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Date$fromTime(1454284800000),
							_1: 1
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Date$fromTime(1456790400000),
								_1: 1
							},
							_1: {ctor: '[]'}
						}
					}
				}
			},
			mdl: _MichaelCombs28$elm_mdl$Material$model
		},
		{
			ctor: '::',
			_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$App$PhoenixMsg, phxCmd),
			_1: {ctor: '[]'}
		});
};
var _user$project$App$update = F2(
	function (msg, model) {
		var _p3 = msg;
		switch (_p3.ctor) {
			case 'PhoenixMsg':
				var _p4 = A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$update, _p3._0, model.phxSocket);
				var phxSocket = _p4._0;
				var phxCmd = _p4._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{phxSocket: phxSocket}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$App$PhoenixMsg, phxCmd)
				};
			case 'Mdl':
				return A2(_MichaelCombs28$elm_mdl$Material$update, _p3._0, model);
			case 'ReceiveChatMessage':
				var _p5 = A2(_elm_lang$core$Json_Decode$decodeValue, _user$project$App$chatMessageDecoder, _p3._0);
				if (_p5.ctor === 'Ok') {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								messages: {ctor: '::', _0: _p5._0.body, _1: model.messages}
							}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				} else {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				}
			case 'SetNewMessage':
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_elm_lang$core$Native_Utils.update(
						model,
						{currentMessage: _p3._0}),
					{ctor: '[]'});
			case 'UpdateControlDisplay':
				var _p6 = model.joystickIndex;
				if (_p6.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				} else {
					return {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$Joystick$poll(_p6._0)
					};
				}
			case 'SendControlToServer':
				var payload = _elm_lang$core$Json_Encode$object(
					{
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'x',
							_1: _elm_lang$core$Json_Encode$float(model.joystick.x)
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'y',
								_1: _elm_lang$core$Json_Encode$float(model.joystick.y)
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: 'rotation',
									_1: _elm_lang$core$Json_Encode$float(model.joystick.rotation)
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'thrust',
										_1: _elm_lang$core$Json_Encode$float(model.joystick.thrust)
									},
									_1: {ctor: '[]'}
								}
							}
						}
					});
				var push = A2(
					_fbonetti$elm_phoenix_socket$Phoenix_Push$withPayload,
					payload,
					A2(_fbonetti$elm_phoenix_socket$Phoenix_Push$init, 'joystick', 'client'));
				var _p7 = A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$push, push, model.phxSocket);
				var phxSocket = _p7._0;
				var phxCmd = _p7._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{phxSocket: phxSocket}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$App$PhoenixMsg, phxCmd)
				};
			case 'GamepadConnected':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							joystickIndex: _elm_lang$core$Maybe$Just(_p3._0)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'GamepadDisconnected':
				return _elm_lang$core$Native_Utils.eq(
					_elm_lang$core$Maybe$Just(_p3._0),
					model.joystickIndex) ? {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{joystickIndex: _elm_lang$core$Maybe$Nothing}),
					_1: _elm_lang$core$Platform_Cmd$none
				} : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
			case 'AxisData':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{joystick: _p3._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				var payload = _elm_lang$core$Json_Encode$object(
					{
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: 'body',
							_1: _elm_lang$core$Json_Encode$string(model.currentMessage)
						},
						_1: {ctor: '[]'}
					});
				var push = A2(
					_fbonetti$elm_phoenix_socket$Phoenix_Push$withPayload,
					payload,
					A2(_fbonetti$elm_phoenix_socket$Phoenix_Push$init, 'new_msg', 'client'));
				var _p8 = A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$push, push, model.phxSocket);
				var phxSocket = _p8._0;
				var phxCmd = _p8._1;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{currentMessage: '', phxSocket: phxSocket}),
					_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$App$PhoenixMsg, phxCmd)
				};
		}
	});
var _user$project$App$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(_fbonetti$elm_phoenix_socket$Phoenix_Socket$listen, model.phxSocket, _user$project$App$PhoenixMsg),
			_1: {
				ctor: '::',
				_0: _user$project$Joystick$axisData(_user$project$App$AxisData),
				_1: {
					ctor: '::',
					_0: _user$project$Joystick$connected(_user$project$App$GamepadConnected),
					_1: {
						ctor: '::',
						_0: _user$project$Joystick$disconnected(_user$project$App$GamepadDisconnected),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$millisecond * 10, _user$project$App$UpdateControlDisplay),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Time$every, _elm_lang$core$Time$millisecond * 500, _user$project$App$SendControlToServer),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		});
};
var _user$project$App$main = _elm_lang$html$Html$programWithFlags(
	{init: _user$project$App$init, update: _user$project$App$update, subscriptions: _user$project$App$subscriptions, view: _user$project$App$view})(
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (host) {
			return _elm_lang$core$Json_Decode$succeed(
				{host: host});
		},
		A2(_elm_lang$core$Json_Decode$field, 'host', _elm_lang$core$Json_Decode$string)));

var Elm = {};
Elm['App'] = Elm['App'] || {};
if (typeof _user$project$App$main !== 'undefined') {
    _user$project$App$main(Elm['App'], 'App', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);
